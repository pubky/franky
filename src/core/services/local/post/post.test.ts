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
    it('should save a new post', async () => {
      await Core.LocalPostService.create(createSaveParams('Hello, world!'));

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost).toBeTruthy();
      expect(savedPost!.content).toBe('Hello, world!');
      expect(savedPost!.kind).toBe('short');
    });

    it('should create all related models when saving a post', async () => {
      await Core.LocalPostService.create(createSaveParams('Test post'));

      const [details, counts, relationships, tags] = await Promise.all([
        getSavedPost(testData.fullPostId1),
        getSavedCounts(testData.fullPostId1),
        getSavedRelationships(testData.fullPostId1),
        getSavedTags(testData.fullPostId1),
      ]);

      expect(details).toBeTruthy();
      expect(counts).toBeTruthy();
      expect(relationships).toBeTruthy();
      expect(tags).toBeTruthy();
    });

    it('should initialize counts to zero', async () => {
      await Core.LocalPostService.create(createSaveParams('Test post'));

      const savedCounts = await getSavedCounts(testData.fullPostId1);
      expect(savedCounts!.tags).toBe(0);
      expect(savedCounts!.unique_tags).toBe(0);
      expect(savedCounts!.replies).toBe(0);
      expect(savedCounts!.reposts).toBe(0);
    });

    it('should initialize tags as empty array', async () => {
      await Core.LocalPostService.create(createSaveParams('Test post'));

      const savedTags = await getSavedTags(testData.fullPostId1);
      expect(savedTags!.tags).toEqual([]);
    });

    it('should set parentUri in relationships for replies', async () => {
      const parentUri = `pubky://${testData.authorPubky}/pub/pubky.app/posts/parent123`;
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('This is a reply'),
        parentUri,
      };

      await Core.LocalPostService.create(saveParams);

      const savedRelationships = await getSavedRelationships(testData.fullPostId1);
      expect(savedRelationships!.replied).toBe(parentUri);
    });

    it('should increment parent reply count when creating a reply', async () => {
      const parentPostId = 'parent:post123';
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;

      // Setup parent post
      await setupExistingPost(parentPostId, 'Parent post');

      // Create reply
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('This is a reply', testData.fullPostId1),
        parentUri,
      };

      await Core.LocalPostService.create(saveParams);

      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(1);
    });

    it('should handle posts with attachments', async () => {
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('Post with images'),
        attachments: ['image1.jpg', 'image2.png'],
      };

      await Core.LocalPostService.create(saveParams);

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.attachments).toEqual(['image1.jpg', 'image2.png']);
    });

    it('should handle long-form posts', async () => {
      const saveParams: TLocalSavePostParams = {
        ...createSaveParams('This is a long-form post with more content'),
        kind: 'long',
      };

      await Core.LocalPostService.create(saveParams);

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.kind).toBe('long');
    });

    it('should generate correct URI format', async () => {
      await Core.LocalPostService.create(createSaveParams('Test post'));

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.uri).toBe(`pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId1}`);
    });

    it('should set indexed_at timestamp', async () => {
      const before = Date.now();
      await Core.LocalPostService.create(createSaveParams('Test post'));
      const after = Date.now();

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.indexed_at).toBeGreaterThanOrEqual(before);
      expect(savedPost!.indexed_at).toBeLessThanOrEqual(after);
    });

    it('should initialize relationships with null values for non-replies', async () => {
      await Core.LocalPostService.create(createSaveParams('Test post'));

      const savedRelationships = await getSavedRelationships(testData.fullPostId1);
      expect(savedRelationships!.replied).toBeNull();
      expect(savedRelationships!.reposted).toBeNull();
      expect(savedRelationships!.mentioned).toEqual([]);
    });

    it('should write atomically across tables (rollback on error)', async () => {
      // Arrange: spy to throw on PostTagsModel.create
      const spy = vi.spyOn(Core.PostTagsModel, 'create').mockRejectedValueOnce(new Error('Simulated failure'));
      const params = createSaveParams('Atomic write test');

      try {
        // Act + Assert
        await expect(Core.LocalPostService.create(params)).rejects.toThrow('Failed to save post');

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

    it('should commit all writes across tables on success', async () => {
      await Core.LocalPostService.create(createSaveParams('Atomic success'));

      const [details, counts, relationships, tags] = await Promise.all([
        getSavedPost(testData.fullPostId1),
        getSavedCounts(testData.fullPostId1),
        getSavedRelationships(testData.fullPostId1),
        getSavedTags(testData.fullPostId1),
      ]);

      expect(details).toBeTruthy();
      expect(counts).toBeTruthy();
      expect(relationships).toBeTruthy();
      expect(tags).toBeTruthy();
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
      await Core.LocalPostService.create(saveParams);

      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(1);
    });

    it('should log an error on failure with minimal context', async () => {
      const loggerSpy = vi.spyOn(Logger, 'error');

      // Force a failure early
      const originalCreate = Core.PostDetailsModel.create;
      vi.spyOn(Core.PostDetailsModel, 'create').mockRejectedValueOnce(new Error('boom'));

      const params = createSaveParams('Will fail');
      await expect(Core.LocalPostService.create(params)).rejects.toThrow('Failed to save post');

      expect(loggerSpy).toHaveBeenCalledWith('Failed to save post', {
        postId: params.postId,
        authorId: params.authorId,
      });

      // Restore
      vi.spyOn(Core.PostDetailsModel, 'create').mockImplementation(originalCreate);
    });
  });
});
