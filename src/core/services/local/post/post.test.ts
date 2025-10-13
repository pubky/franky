import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import { Logger } from '@/libs';
import type { TLocalSavePostParams } from './post.types';

// Test data
const testData = {
  authorPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  postId1: 'abc123xyz',
  postId2: 'def456uvw',
  get fullPostId1() {
    return Core.buildPostCompositeId({ pubky: this.authorPubky, postId: this.postId1 });
  },
  get fullPostId2() {
    return Core.buildPostCompositeId({ pubky: this.authorPubky, postId: this.postId2 });
  },
};

// Helper functions
const createSaveParams = (content: string, postId?: string): TLocalSavePostParams => ({
  postId: postId || testData.fullPostId1,
  content,
  kind: 'short',
  authorId: testData.authorPubky,
  parentUri: undefined,
  attachments: undefined,
});

const getSavedPost = async (postId: string) => {
  return await Core.PostDetailsModel.table.get(postId);
};

const getSavedCounts = async (postId: string) => {
  return await Core.PostCountsModel.table.get(postId);
};

const getSavedRelationships = async (postId: string) => {
  return await Core.PostRelationshipsModel.table.get(postId);
};

const getSavedTags = async (postId: string) => {
  return await Core.PostTagsModel.table.get(postId);
};

const setupExistingPost = async (postId: string, content: string, parentUri?: string) => {
  const { pubky, postId: postIdPart } = Core.parsePostCompositeId(postId);
  const postDetails: Core.PostDetailsModelSchema = {
    id: postId,
    content,
    indexed_at: Date.now(),
    kind: 'short',
    uri: `pubky://${pubky}/pub/pubky.app/posts/${postIdPart}`,
    attachments: null,
  };

  const postCounts: Core.PostCountsModelSchema = {
    id: postId,
    tags: 0,
    unique_tags: 0,
    replies: 0,
    reposts: 0,
  };

  const postRelationships: Core.PostRelationshipsModelSchema = {
    id: postId,
    replied: parentUri || null,
    reposted: null,
    mentioned: [],
  };

  await Core.PostDetailsModel.table.add(postDetails);
  await Core.PostCountsModel.table.add(postCounts);
  await Core.PostRelationshipsModel.table.add(postRelationships);
  await Core.PostTagsModel.create({ id: postId, tags: [] });
};

describe('LocalPostService', () => {
  beforeEach(async () => {
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

  describe('save', () => {
    it('should save post with all related models initialized', async () => {
      await Core.Local.Post.create(createSaveParams('Hello, world!'));

      const [details, counts, relationships, tags] = await Promise.all([
        getSavedPost(testData.fullPostId1),
        getSavedCounts(testData.fullPostId1),
        getSavedRelationships(testData.fullPostId1),
        getSavedTags(testData.fullPostId1),
      ]);

      expect(details).toBeTruthy();
      expect(details!.content).toBe('Hello, world!');
      expect(details!.kind).toBe('short');

      expect(counts).toBeTruthy();
      expect(counts!.tags).toBe(0);
      expect(counts!.replies).toBe(0);
      expect(counts!.reposts).toBe(0);

      expect(tags).toBeTruthy();
      expect(tags!.tags).toEqual([]);

      expect(relationships).toBeTruthy();
      expect(relationships!.replied).toBeNull();
      expect(relationships!.reposted).toBeNull();
    });

    it('should set parentUri in relationships for replies', async () => {
      const parentUri = `pubky://${testData.authorPubky}/pub/pubky.app/posts/parent123`;
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('This is a reply'),
        parentUri,
      };

      await Core.Local.Post.create(saveParams);

      const savedRelationships = await getSavedRelationships(testData.fullPostId1);
      expect(savedRelationships!.replied).toBe(parentUri);
    });

    it('should increment parent reply count when creating a reply', async () => {
      const parentPostId = 'parent:post123';
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;

      await setupExistingPost(parentPostId, 'Parent post');

      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('This is a reply', testData.fullPostId1),
        parentUri,
      };

      await Core.Local.Post.create(saveParams);

      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(1);
    });

    it('should handle reply creation when parent post does not exist', async () => {
      const parentUri = `pubky://nonexistent/pub/pubky.app/posts/missing123`;

      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('Reply to missing parent', testData.fullPostId1),
        parentUri,
      };

      // Should not throw - just silently skips incrementing non-existent parent
      await expect(Core.Local.Post.create(saveParams)).resolves.not.toThrow();

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost).toBeTruthy();
      expect(savedPost!.content).toBe('Reply to missing parent');
    });

    it('should handle posts with attachments', async () => {
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('Post with images'),
        attachments: ['image1.jpg', 'image2.png'],
      };

      await Core.Local.Post.create(saveParams);

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.attachments).toEqual(['image1.jpg', 'image2.png']);
    });

    it('should handle long-form posts', async () => {
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('This is a long-form post with more content'),
        kind: 'long',
      };

      await Core.Local.Post.create(saveParams);

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.kind).toBe('long');
    });

    it('should generate correct URI format', async () => {
      await Core.Local.Post.create(createSaveParams('Test post'));

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.uri).toBe(`pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId1}`);
    });

    it('should set indexed_at timestamp', async () => {
      const before = Date.now();
      await Core.Local.Post.create(createSaveParams('Test post'));
      const after = Date.now();

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.indexed_at).toBeGreaterThanOrEqual(before);
      expect(savedPost!.indexed_at).toBeLessThanOrEqual(after);
    });

    it('should write atomically across tables (rollback on error)', async () => {
      // Arrange: spy to throw on PostTagsModel.create
      const spy = vi.spyOn(Core.PostTagsModel, 'create').mockRejectedValueOnce(new Error('Simulated failure'));
      const params = createSaveParams('Atomic write test');

      try {
        // Act + Assert
        await expect(Core.Local.Post.create(params)).rejects.toThrow('Failed to save post');

        // Validate no partial data remains
        const [details, counts, relationships, tags] = await Promise.all([
          getSavedPost(testData.fullPostId1),
          getSavedCounts(testData.fullPostId1),
          getSavedRelationships(testData.fullPostId1),
          getSavedTags(testData.fullPostId1),
        ]);

        expect(details).toBeUndefined();
        expect(counts).toBeUndefined();
        expect(relationships).toBeUndefined();
        expect(tags).toBeUndefined();
      } finally {
        spy.mockRestore();
      }
    });

    it('should increment parent replies via counts update when saving a reply', async () => {
      const parentPostId = 'parent:post123';
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;

      // Setup parent
      await setupExistingPost(parentPostId, 'Parent post');

      // Act: save reply
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('Reply here', testData.fullPostId1),
        parentUri,
      };
      await Core.Local.Post.create(saveParams);

      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(1);
    });

    it('should log an error on failure with minimal context', async () => {
      const loggerSpy = vi.spyOn(Logger, 'error');

      // Force a failure early
      const originalCreate = Core.PostDetailsModel.create;
      vi.spyOn(Core.PostDetailsModel, 'create').mockRejectedValueOnce(new Error('boom'));

      const params = createSaveParams('Will fail');
      await expect(Core.Local.Post.create(params)).rejects.toThrow('Failed to save post');

      expect(loggerSpy).toHaveBeenCalledWith('Failed to save post', {
        postId: params.postId,
        authorId: params.authorId,
      });

      // Restore
      vi.spyOn(Core.PostDetailsModel, 'create').mockImplementation(originalCreate);
    });
  });

  describe('repost', () => {
    it('should create a repost with relationship to original post', async () => {
      const originalPostId = 'original:post123';
      const repostId = testData.fullPostId1;
      const originalUri = `pubky://original/pub/pubky.app/posts/post123`;

      // Setup original post
      await setupExistingPost(originalPostId, 'Original post content');

      // Create repost
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('', repostId),
        kind: 'repost',
        repostedUri: originalUri,
      };

      await Core.Local.Post.create(saveParams);

      const savedRelationships = await getSavedRelationships(repostId);
      expect(savedRelationships!.reposted).toBe(originalUri);
    });

    it('should increment original post repost count when creating repost', async () => {
      const originalPostId = 'original:post123';
      const repostId = testData.fullPostId1;
      const originalUri = `pubky://original/pub/pubky.app/posts/post123`;

      // Setup original post
      await setupExistingPost(originalPostId, 'Original post');

      // Create repost
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('', repostId),
        kind: 'repost',
        repostedUri: originalUri,
      };

      await Core.Local.Post.create(saveParams);

      const originalCounts = await getSavedCounts(originalPostId);
      expect(originalCounts!.reposts).toBe(1);
    });

    it('should create repost with content for quote reposts', async () => {
      const originalPostId = 'original:post123';
      const repostId = testData.fullPostId1;
      const originalUri = `pubky://original/pub/pubky.app/posts/post123`;
      const quoteContent = 'This is great!';

      // Setup original post
      await setupExistingPost(originalPostId, 'Original post');

      // Create quote repost
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams(quoteContent, repostId),
        kind: 'repost',
        repostedUri: originalUri,
      };

      await Core.Local.Post.create(saveParams);

      const savedPost = await getSavedPost(repostId);
      expect(savedPost!.content).toBe(quoteContent);
      expect(savedPost!.kind).toBe('repost');

      const savedRelationships = await getSavedRelationships(repostId);
      expect(savedRelationships!.reposted).toBe(originalUri);
    });
  });

  describe('deletePost', () => {
    it('should delete post and all related records', async () => {
      const postId = testData.fullPostId1;

      await setupExistingPost(postId, 'Test post');

      await Core.Local.Post.delete({
        postId,
        deleterId: testData.authorPubky,
      });

      const [details, counts, relationships, tags] = await Promise.all([
        getSavedPost(postId),
        getSavedCounts(postId),
        getSavedRelationships(postId),
        getSavedTags(postId),
      ]);

      expect(details).toBeUndefined();
      expect(counts).toBeUndefined();
      expect(relationships).toBeUndefined();
      expect(tags).toBeUndefined();
    });

    it('should fetch relationships from database to determine reply/repost status', async () => {
      const parentPostId = 'parent:post123';
      const replyId = testData.fullPostId1;
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;

      await setupExistingPost(parentPostId, 'Parent post');
      await Core.PostCountsModel.update(parentPostId, { replies: 1 });
      await setupExistingPost(replyId, 'Reply post', parentUri);

      // Delete only passes postId and deleterId - relationships are fetched internally
      await Core.Local.Post.delete({
        postId: replyId,
        deleterId: testData.authorPubky,
      });

      // Verify parent count was decremented (proving relationships were fetched)
      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(0);
    });

    it('should handle delete when parent/original post no longer exists', async () => {
      const replyId = testData.fullPostId1;
      const parentUri = `pubky://nonexistent/pub/pubky.app/posts/missing123`;

      await setupExistingPost(replyId, 'Reply to deleted parent', parentUri);

      // Should not throw - just silently skips decrementing non-existent parent
      await expect(
        Core.Local.Post.delete({
          postId: replyId,
          deleterId: testData.authorPubky,
        }),
      ).resolves.not.toThrow();

      const deletedPost = await getSavedPost(replyId);
      expect(deletedPost).toBeUndefined();
    });

    it('should decrement parent reply count when deleting a reply', async () => {
      const parentPostId = 'parent:post123';
      const replyId = testData.fullPostId1;
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;

      // Setup parent post
      await setupExistingPost(parentPostId, 'Parent post');
      await Core.PostCountsModel.update(parentPostId, { replies: 1 });

      // Setup reply
      await setupExistingPost(replyId, 'Reply post', parentUri);

      // Delete reply
      await Core.Local.Post.delete({
        postId: replyId,
        deleterId: testData.authorPubky,
      });

      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(0);
    });

    it('should decrement original post repost count when deleting a repost', async () => {
      const originalPostId = 'original:post123';
      const repostId = testData.fullPostId1;
      const originalUri = `pubky://original/pub/pubky.app/posts/post123`;

      // Setup original post
      await setupExistingPost(originalPostId, 'Original post');
      await Core.PostCountsModel.update(originalPostId, { reposts: 1 });

      // Setup repost
      await setupExistingPost(repostId, '');
      await Core.PostRelationshipsModel.update(repostId, { reposted: originalUri });

      // Delete repost
      await Core.Local.Post.delete({
        postId: repostId,
        deleterId: testData.authorPubky,
      });

      const originalCounts = await getSavedCounts(originalPostId);
      expect(originalCounts!.reposts).toBe(0);
    });

    it('should not decrement counts below zero', async () => {
      const parentPostId = 'parent:post123';
      const replyId = testData.fullPostId1;
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;

      // Setup with count already at 0
      await setupExistingPost(parentPostId, 'Parent post');
      await setupExistingPost(replyId, 'Reply post', parentUri);

      // Delete reply
      await Core.Local.Post.delete({
        postId: replyId,
        deleterId: testData.authorPubky,
      });

      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(0);
    });

    it('should handle deleting a post that is both a reply and a repost', async () => {
      const parentPostId = 'parent:post123';
      const originalPostId = 'original:post456';
      const postId = testData.fullPostId1;
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;
      const originalUri = `pubky://original/pub/pubky.app/posts/post456`;

      // Setup parent and original posts
      await setupExistingPost(parentPostId, 'Parent post');
      await Core.PostCountsModel.update(parentPostId, { replies: 1 });
      await setupExistingPost(originalPostId, 'Original post');
      await Core.PostCountsModel.update(originalPostId, { reposts: 1 });

      // Setup post that is both reply and repost
      await setupExistingPost(postId, 'Quote repost as reply', parentUri);
      await Core.PostRelationshipsModel.update(postId, { reposted: originalUri });

      // Delete post
      await Core.Local.Post.delete({
        postId,
        deleterId: testData.authorPubky,
      });

      const parentCounts = await getSavedCounts(parentPostId);
      const originalCounts = await getSavedCounts(originalPostId);
      expect(parentCounts!.replies).toBe(0);
      expect(originalCounts!.reposts).toBe(0);
    });

    it('should rollback delete operation on transaction failure', async () => {
      const parentPostId = 'parent:post123';
      const replyId = testData.fullPostId1;
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;

      // Setup parent and reply
      await setupExistingPost(parentPostId, 'Parent post');
      await Core.PostCountsModel.update(parentPostId, { replies: 1 });
      await setupExistingPost(replyId, 'Reply post', parentUri);

      // Spy to force failure during transaction
      const spy = vi.spyOn(Core.PostDetailsModel, 'deleteById').mockRejectedValueOnce(new Error('Simulated failure'));

      try {
        await expect(
          Core.Local.Post.delete({
            postId: replyId,
            deleterId: testData.authorPubky,
          }),
        ).rejects.toThrow('Failed to delete post');

        // Verify rollback - all data should still exist
        const [details, counts, relationships, tags] = await Promise.all([
          getSavedPost(replyId),
          getSavedCounts(replyId),
          getSavedRelationships(replyId),
          getSavedTags(replyId),
        ]);

        expect(details).toBeTruthy();
        expect(counts).toBeTruthy();
        expect(relationships).toBeTruthy();
        expect(tags).toBeTruthy();

        // Parent count should not have been decremented
        const parentCounts = await getSavedCounts(parentPostId);
        expect(parentCounts!.replies).toBe(1);
      } finally {
        spy.mockRestore();
      }
    });
  });
});
