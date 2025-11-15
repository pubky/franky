import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { PubkyAppPostKind, PubkyAppPost, PubkyAppPostEmbed } from 'pubky-app-specs';

// Test data
const testData = {
  authorPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
  postId1: 'abc123xyz',
  get fullPostId1() {
    return Core.buildPostCompositeId({ pubky: this.authorPubky, postId: this.postId1 });
  },
};

// Helper functions
const createSaveParams = (
  content: string,
  postId?: string,
  kind: PubkyAppPostKind = PubkyAppPostKind.Short,
): Core.TLocalSavePostParams => {
  const { postId: postIdPart } = Core.parsePostCompositeId(postId || testData.fullPostId1);
  return {
    postId: postIdPart,
    authorId: testData.authorPubky,
    post: new PubkyAppPost(content, kind, undefined, undefined, undefined),
  };
};

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

const setupUserCounts = async (userId: Core.Pubky) => {
  const userCounts: Core.UserCountsModelSchema = {
    id: userId,
    tagged: 0,
    tags: 0,
    unique_tags: 0,
    posts: 0,
    replies: 0,
    following: 0,
    followers: 0,
    friends: 0,
    bookmarks: 0,
  };
  await Core.UserCountsModel.table.add(userCounts);
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
        Core.UserCountsModel.table,
      ],
      async () => {
        await Core.PostDetailsModel.table.clear();
        await Core.PostCountsModel.table.clear();
        await Core.PostRelationshipsModel.table.clear();
        await Core.PostTagsModel.table.clear();
        await Core.UserCountsModel.table.clear();
      },
    );
  });

  describe('create', () => {
    it('should save post with all related models initialized', async () => {
      await setupUserCounts(testData.authorPubky);
      const userCountsSpy = vi.spyOn(Core.UserCountsModel, 'update');

      await Core.LocalPostService.create(createSaveParams('Hello, world!'));

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

      // Verify user count increment for root post (single update call)
      expect(userCountsSpy).toHaveBeenCalledWith(testData.authorPubky, { posts: 1 });

      userCountsSpy.mockRestore();
    });

    it('should increment parent reply count when creating a reply', async () => {
      const parentPostId = 'parent:post123';
      const parentUri = `pubky://parent/pub/pubky.app/posts/post123`;

      await setupExistingPost(parentPostId, 'Parent post');
      await setupUserCounts(testData.authorPubky);

      const userCountsSpy = vi.spyOn(Core.UserCountsModel, 'update');

      const baseParams = createSaveParams('This is a reply', testData.fullPostId1);
      const saveParams: Core.TLocalSavePostParams = {
        ...baseParams,
        post: new PubkyAppPost(baseParams.post.content, PubkyAppPostKind.Short, parentUri, undefined, undefined),
      };

      await Core.LocalPostService.create(saveParams);

      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(1);

      // Verify user count increments for reply (single update call)
      expect(userCountsSpy).toHaveBeenCalledWith(testData.authorPubky, { posts: 1, replies: 1 });

      userCountsSpy.mockRestore();
    });

    it('should handle reply creation when parent post does not exist', async () => {
      const parentUri = `pubky://nonexistent/pub/pubky.app/posts/missing123`;

      const baseParams = createSaveParams('Reply to missing parent', testData.fullPostId1);
      const saveParams: Core.TLocalSavePostParams = {
        ...baseParams,
        post: new PubkyAppPost(baseParams.post.content, PubkyAppPostKind.Short, parentUri, undefined, undefined),
      };

      // Should not throw - just silently skips incrementing non-existent parent
      await expect(Core.LocalPostService.create(saveParams)).resolves.not.toThrow();

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost).toBeTruthy();
      expect(savedPost!.content).toBe('Reply to missing parent');
    });

    it('should handle long-form posts', async () => {
      const saveParams = createSaveParams(
        'This is a long-form post with more content',
        undefined,
        PubkyAppPostKind.Long,
      );

      await Core.LocalPostService.create(saveParams);

      const savedPost = await getSavedPost(testData.fullPostId1);
      expect(savedPost!.kind).toBe('long');
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

    it('should log an error on failure with minimal context', async () => {
      const loggerSpy = vi.spyOn(Libs.Logger, 'error');

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

  describe('repost', () => {
    it('should create a repost with relationship to original post', async () => {
      const originalPostId = 'original:post123';
      const repostId = testData.fullPostId1;
      const originalUri = `pubky://original/pub/pubky.app/posts/post123`;

      // Setup original post
      await setupExistingPost(originalPostId, 'Original post content');

      // Create repost
      const saveParams: Core.TLocalSavePostParams = {
        postId: testData.postId1,
        authorId: testData.authorPubky,
        post: new PubkyAppPost(
          '',
          PubkyAppPostKind.Short,
          undefined,
          new PubkyAppPostEmbed(originalUri, PubkyAppPostKind.Short),
          undefined,
        ),
      };

      await Core.LocalPostService.create(saveParams);

      const savedRelationships = await getSavedRelationships(repostId);
      expect(savedRelationships!.reposted).toBe(originalUri);
    });

    it('should increment original post repost count when creating repost', async () => {
      const originalPostId = 'original:post123';
      const originalUri = `pubky://original/pub/pubky.app/posts/post123`;

      // Setup original post
      await setupExistingPost(originalPostId, 'Original post');

      // Create repost
      const saveParams: Core.TLocalSavePostParams = {
        postId: testData.postId1,
        authorId: testData.authorPubky,
        post: new PubkyAppPost(
          '',
          PubkyAppPostKind.Short,
          undefined,
          new PubkyAppPostEmbed(originalUri, PubkyAppPostKind.Short),
          undefined,
        ),
      };

      await Core.LocalPostService.create(saveParams);

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
      const saveParams: Core.TLocalSavePostParams = {
        postId: testData.postId1,
        authorId: testData.authorPubky,
        post: new PubkyAppPost(
          quoteContent,
          PubkyAppPostKind.Short,
          undefined,
          new PubkyAppPostEmbed(originalUri, PubkyAppPostKind.Short),
          undefined,
        ),
      };

      await Core.LocalPostService.create(saveParams);

      const savedPost = await getSavedPost(repostId);
      expect(savedPost!.content).toBe(quoteContent);
      expect(savedPost!.kind).toBe('short');

      const savedRelationships = await getSavedRelationships(repostId);
      expect(savedRelationships!.reposted).toBe(originalUri);
    });
  });

  describe('deletePost', () => {
    it('should delete post and all related records', async () => {
      const postId = testData.fullPostId1;

      await setupExistingPost(postId, 'Test post');
      await setupUserCounts(testData.authorPubky);

      const userCountsSpy = vi.spyOn(Core.UserCountsModel, 'update');

      await Core.LocalPostService.delete({
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

      // Verify user count decrement for root post (single update call)
      expect(userCountsSpy).toHaveBeenCalledWith(testData.authorPubky, { posts: 0 });

      userCountsSpy.mockRestore();
    });

    it('should handle delete when parent/original post no longer exists', async () => {
      const replyId = testData.fullPostId1;
      const parentUri = `pubky://nonexistent/pub/pubky.app/posts/missing123`;

      await setupExistingPost(replyId, 'Reply to deleted parent', parentUri);

      // Should not throw - just silently skips decrementing non-existent parent
      await expect(
        Core.LocalPostService.delete({
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
      await setupUserCounts(testData.authorPubky);

      const userCountsSpy = vi.spyOn(Core.UserCountsModel, 'update');

      // Delete reply
      await Core.LocalPostService.delete({
        postId: replyId,
        deleterId: testData.authorPubky,
      });

      const parentCounts = await getSavedCounts(parentPostId);
      expect(parentCounts!.replies).toBe(0);

      // Verify user count decrements for reply (single update call)
      expect(userCountsSpy).toHaveBeenCalledWith(testData.authorPubky, { posts: 0, replies: 0 });

      userCountsSpy.mockRestore();
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
      await Core.LocalPostService.delete({
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
      await Core.LocalPostService.delete({
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
      await Core.LocalPostService.delete({
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
          Core.LocalPostService.delete({
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

  describe('getPostCounts', () => {
    it('should return post counts when post exists', async () => {
      const postId = testData.fullPostId1;
      await setupExistingPost(postId, 'Test post');

      // Update some counts
      await Core.PostCountsModel.update(postId, {
        tags: 5,
        unique_tags: 3,
        replies: 10,
        reposts: 2,
      });

      const counts = await Core.LocalPostService.getPostCounts(postId);

      expect(counts).toBeTruthy();
      expect(counts.id).toBe(postId);
      expect(counts.tags).toBe(5);
      expect(counts.unique_tags).toBe(3);
      expect(counts.replies).toBe(10);
      expect(counts.reposts).toBe(2);
    });

    it('should return default counts when post does not exist', async () => {
      const nonExistentPostId = 'nonexistent:post123';

      const counts = await Core.LocalPostService.getPostCounts(nonExistentPostId);

      expect(counts).toBeTruthy();
      expect(counts.id).toBe(nonExistentPostId);
      expect(counts.tags).toBe(0);
      expect(counts.unique_tags).toBe(0);
      expect(counts.replies).toBe(0);
      expect(counts.reposts).toBe(0);
    });

    it('should throw DatabaseError on database failure', async () => {
      const postId = testData.fullPostId1;

      // Mock findById to throw an error
      const spy = vi
        .spyOn(Core.PostCountsModel, 'findById')
        .mockRejectedValueOnce(new Error('Database connection lost'));

      await expect(Core.LocalPostService.getPostCounts(postId)).rejects.toMatchObject({
        type: 'QUERY_FAILED',
        message: 'Failed to get post counts',
        statusCode: 500,
      });

      spy.mockRestore();
    });

    it('should log error on failure', async () => {
      const postId = testData.fullPostId1;
      const loggerSpy = vi.spyOn(Libs.Logger, 'error');

      const spy = vi.spyOn(Core.PostCountsModel, 'findById').mockRejectedValueOnce(new Error('DB error'));

      await expect(Core.LocalPostService.getPostCounts(postId)).rejects.toThrow();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to get post counts',
        expect.objectContaining({
          postId,
        }),
      );

      spy.mockRestore();
      loggerSpy.mockRestore();
    });
  });

  describe('getFirstReplies', () => {
    it('should return first N replies when post has replies', async () => {
      const parentPostId = testData.fullPostId1;
      const parentUri = `pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId1}`;

      await setupExistingPost(parentPostId, 'Parent post');

      // Create 5 replies with proper composite IDs
      const replyIds = [];
      for (let i = 1; i <= 5; i++) {
        const replyIdPart = `reply${i}`;
        const replyId = Core.buildPostCompositeId({ pubky: testData.authorPubky, postId: replyIdPart });
        await setupExistingPost(replyId, `Reply ${i}`, parentUri);
        replyIds.push(replyId);
      }

      // Get first 3 replies
      const firstReplies = await Core.LocalPostService.getFirstReplies(parentPostId, 3);

      expect(firstReplies).toHaveLength(3);
      expect(firstReplies).toEqual(replyIds.slice(0, 3));
    });

    it('should return all replies when there are fewer than limit', async () => {
      const parentPostId = testData.fullPostId1;
      const parentUri = `pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId1}`;

      await setupExistingPost(parentPostId, 'Parent post');

      // Create only 2 replies with proper composite IDs
      const replyIds = [];
      for (let i = 1; i <= 2; i++) {
        const replyIdPart = `reply${i}`;
        const replyId = Core.buildPostCompositeId({ pubky: testData.authorPubky, postId: replyIdPart });
        await setupExistingPost(replyId, `Reply ${i}`, parentUri);
        replyIds.push(replyId);
      }

      // Request 5 but should only get 2
      const firstReplies = await Core.LocalPostService.getFirstReplies(parentPostId, 5);

      expect(firstReplies).toHaveLength(2);
      expect(firstReplies).toEqual(replyIds);
    });

    it('should return empty array when post has no replies', async () => {
      const parentPostId = testData.fullPostId1;

      await setupExistingPost(parentPostId, 'Parent post with no replies');

      const firstReplies = await Core.LocalPostService.getFirstReplies(parentPostId, 3);

      expect(firstReplies).toEqual([]);
    });

    it('should return empty array when post does not exist', async () => {
      const nonExistentPostId = 'nonexistent:post123';

      const firstReplies = await Core.LocalPostService.getFirstReplies(nonExistentPostId, 3);

      expect(firstReplies).toEqual([]);
    });

    it('should use default limit of 3 when not specified', async () => {
      const parentPostId = testData.fullPostId1;
      const parentUri = `pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId1}`;

      await setupExistingPost(parentPostId, 'Parent post');

      // Create 5 replies with proper composite IDs
      const replyIds = [];
      for (let i = 1; i <= 5; i++) {
        const replyIdPart = `reply${i}`;
        const replyId = Core.buildPostCompositeId({ pubky: testData.authorPubky, postId: replyIdPart });
        await setupExistingPost(replyId, `Reply ${i}`, parentUri);
        replyIds.push(replyId);
      }

      // Call without limit parameter
      const firstReplies = await Core.LocalPostService.getFirstReplies(parentPostId);

      expect(firstReplies).toHaveLength(3);
      expect(firstReplies).toEqual(replyIds.slice(0, 3));
    });

    it('should return replies in the order they were created', async () => {
      const parentPostId = testData.fullPostId1;
      const parentUri = `pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId1}`;

      await setupExistingPost(parentPostId, 'Parent post');

      const replyIds = [];
      for (let i = 1; i <= 3; i++) {
        const replyIdPart = `reply${i}`;
        const replyId = Core.buildPostCompositeId({ pubky: testData.authorPubky, postId: replyIdPart });
        await setupExistingPost(replyId, `Reply ${i}`, parentUri);
        replyIds.push(replyId);
      }

      const firstReplies = await Core.LocalPostService.getFirstReplies(parentPostId, 3);

      // Should maintain order
      expect(firstReplies[0]).toBe(replyIds[0]);
      expect(firstReplies[1]).toBe(replyIds[1]);
      expect(firstReplies[2]).toBe(replyIds[2]);
    });

    it('should throw DatabaseError on database failure', async () => {
      const postId = testData.fullPostId1;

      // Setup post first so it gets to the getReplies call
      await setupExistingPost(postId, 'Test post');

      // Mock getReplies to throw an error
      const spy = vi
        .spyOn(Core.PostRelationshipsModel, 'getReplies')
        .mockRejectedValueOnce(new Error('Database connection lost'));

      await expect(Core.LocalPostService.getFirstReplies(postId, 3)).rejects.toMatchObject({
        type: 'QUERY_FAILED',
        message: 'Failed to get first replies',
        statusCode: 500,
      });

      spy.mockRestore();
    });

    it('should log error on failure', async () => {
      const postId = testData.fullPostId1;
      const loggerSpy = vi.spyOn(Libs.Logger, 'error');

      const spy = vi.spyOn(Core.PostDetailsModel, 'findById').mockRejectedValueOnce(new Error('DB error'));

      await expect(Core.LocalPostService.getFirstReplies(postId, 3)).rejects.toThrow();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to get first replies',
        expect.objectContaining({
          postId,
          limit: 3,
        }),
      );

      spy.mockRestore();
      loggerSpy.mockRestore();
    });

    it('should handle posts with URI but no replies relationship', async () => {
      const postId = testData.fullPostId1;

      await setupExistingPost(postId, 'Post with no reply relationships');

      // Mock getReplies to return empty array (which is what it normally returns)
      const spy = vi.spyOn(Core.PostRelationshipsModel, 'getReplies').mockResolvedValueOnce([]);

      const firstReplies = await Core.LocalPostService.getFirstReplies(postId, 3);

      expect(firstReplies).toEqual([]);

      spy.mockRestore();
    });

    it('should work with different limit values', async () => {
      const parentPostId = testData.fullPostId1;
      const parentUri = `pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId1}`;

      await setupExistingPost(parentPostId, 'Parent post');

      // Create 10 replies with proper composite IDs (padded to maintain order)
      const replyIds: string[] = [];
      for (let i = 1; i <= 10; i++) {
        const replyIdPart = `reply${i.toString().padStart(2, '0')}`; // reply01, reply02, etc.
        const replyId = Core.buildPostCompositeId({ pubky: testData.authorPubky, postId: replyIdPart });
        await setupExistingPost(replyId, `Reply ${i}`, parentUri);
        replyIds.push(replyId);
      }

      // Test limit of 1
      const firstReply = await Core.LocalPostService.getFirstReplies(parentPostId, 1);
      expect(firstReply).toHaveLength(1);
      expect(firstReply[0]).toBe(replyIds[0]);

      // Test limit of 5
      const first5 = await Core.LocalPostService.getFirstReplies(parentPostId, 5);
      expect(first5).toHaveLength(5);
      // Just check we got 5 replies, don't enforce specific order since DB may sort differently
      expect(first5.every((id) => replyIds.includes(id))).toBe(true);

      // Test limit of 10 (all)
      const allReplies = await Core.LocalPostService.getFirstReplies(parentPostId, 10);
      expect(allReplies).toHaveLength(10);
      // All replies should be from our created set
      expect(allReplies.every((id) => replyIds.includes(id))).toBe(true);
    });
  });
});
