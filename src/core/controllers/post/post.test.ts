import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';

// Mock homeserver
const mockHomeserver = {
  fetch: vi.fn().mockResolvedValue({ ok: true }),
};

// Mock pubky-app-specs
vi.mock('pubky-app-specs', () => ({
  PubkySpecsBuilder: class {
    createPost(content: string, kind: number) {
      return {
        post: {
          content,
          kind: kind === 0 ? 'short' : kind === 1 ? 'long' : 'short',
          attachments: null,
          toJson: () => ({ content, kind }),
        },
        meta: {
          id: 'post123',
          url: `pubky://author/pub/pubky.app/posts/post123`,
        },
      };
    }
  },
  PubkyAppPostKind: {
    Short: 0,
    Long: 1,
  },
  postUriBuilder: (authorId: string, postId: string) => `pubky://${authorId}/pub/pubky.app/posts/${postId}`,
}));

// Test data
const testData = {
  authorPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  postId: 'abc123xyz',
  get fullPostId() {
    return Core.buildCompositeId({ pubky: this.authorPubky, id: this.postId });
  },
};

// Helper functions
const createPostParams = (content: string, parentPostId?: string): Core.TCreatePostParams => ({
  content,
  authorId: testData.authorPubky,
  parentPostId,
});

const setupExistingPost = async () => {
  const postDetails: Core.PostDetailsModelSchema = {
    id: testData.fullPostId,
    content: 'Test post content',
    indexed_at: Date.now(),
    kind: 'short', // PubkyAppPostKind.Short
    uri: `pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId}`,
    attachments: null,
  };

  await Core.PostDetailsModel.table.add(postDetails);
  await Core.PostCountsModel.table.add({
    id: testData.fullPostId,
    tags: 0,
    unique_tags: 0,
    replies: 0,
    reposts: 0,
  });
  await Core.PostRelationshipsModel.table.add({
    id: testData.fullPostId,
    replied: null,
    reposted: null,
    mentioned: [],
  });
};

describe('PostController', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mockHomeserver.fetch.mockClear();

    // Mock Core module
    vi.doMock('@/core', async () => {
      const actual = await vi.importActual('@/core');
      return {
        ...actual,
        HomeserverService: {
          getInstance: vi.fn(() => mockHomeserver),
          request: vi.fn(async () => undefined),
        },
      };
    });

    // Initialize database and clear tables
    await Core.db.initialize();
    await Core.db.transaction(
      'rw',
      [
        Core.PostDetailsModel.table,
        Core.PostCountsModel.table,
        Core.PostRelationshipsModel.table,
        Core.PostTagsModel.table,
      ],
      async () => {
        await Core.PostDetailsModel.table.clear();
        await Core.PostCountsModel.table.clear();
        await Core.PostRelationshipsModel.table.clear();
        await Core.PostTagsModel.table.clear();
      },
    );
  });

  describe('create', () => {
    it('should create a post and sync to homeserver', async () => {
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });
      const { PostController } = await import('./post');

      await PostController.create(createPostParams('Hello, world!'));

      const allPosts = await Core.PostDetailsModel.table.toArray();
      expect(allPosts.length).toBeGreaterThan(0);

      const savedPost = allPosts[0];
      expect(savedPost.content).toBe('Hello, world!');
      expect(savedPost.kind).toBe('short'); // PubkyAppPostKind.Short
    });

    it('should create a reply when parentPostId is provided', async () => {
      await setupExistingPost();
      mockHomeserver.fetch.mockResolvedValueOnce({ ok: true });
      const { PostController } = await import('./post');

      await PostController.create(createPostParams('This is a reply', testData.fullPostId));

      const allPosts = await Core.PostDetailsModel.table.toArray();
      const replyPost = allPosts.find((p) => p.content === 'This is a reply');

      expect(replyPost).toBeTruthy();
      expect(replyPost!.kind).toBe('short'); // PubkyAppPostKind.Short
    });

    it('should throw error when parent post not found', async () => {
      const { PostController } = await import('./post');

      await expect(PostController.create(createPostParams('Reply', 'nonexistent:post'))).rejects.toThrow(
        'Parent post not found',
      );
    });

    it('should propagate errors from application layer', async () => {
      const { PostController } = await import('./post');
      const ApplicationModule = await import('@/core/application');

      const createSpy = vi
        .spyOn(ApplicationModule.PostApplication, 'create')
        .mockRejectedValueOnce(new Error('Database transaction failed'));

      try {
        await expect(PostController.create(createPostParams('Will fail'))).rejects.toThrow(
          'Database transaction failed',
        );
      } finally {
        createSpy.mockRestore();
      }
    });
  });

  describe('delete', () => {
    it('should call application layer when user is author', async () => {
      await setupExistingPost();
      const { PostController } = await import('./post');
      const ApplicationModule = await import('@/core/application');

      const deleteSpy = vi.spyOn(ApplicationModule.PostApplication, 'delete').mockResolvedValue(undefined);

      try {
        await PostController.delete({
          postId: testData.fullPostId,
          deleterId: testData.authorPubky,
        });

        expect(deleteSpy).toHaveBeenCalledWith({
          postId: testData.fullPostId,
          deleterId: testData.authorPubky,
        });
      } finally {
        deleteSpy.mockRestore();
      }
    });

    it('should throw error when user is not the author', async () => {
      await setupExistingPost();
      const { PostController } = await import('./post');

      await expect(
        PostController.delete({
          postId: testData.fullPostId,
          deleterId: 'different:user' as Core.Pubky,
        }),
      ).rejects.toThrow('User is not the author of this post');
    });

    it('should propagate errors from application layer', async () => {
      await setupExistingPost();
      const { PostController } = await import('./post');
      const ApplicationModule = await import('@/core/application');

      const deleteSpy = vi
        .spyOn(ApplicationModule.PostApplication, 'delete')
        .mockRejectedValueOnce(new Error('Database transaction failed'));

      try {
        await expect(
          PostController.delete({
            postId: testData.fullPostId,
            deleterId: testData.authorPubky,
          }),
        ).rejects.toThrow('Database transaction failed');
      } finally {
        deleteSpy.mockRestore();
      }
    });
  });
});
