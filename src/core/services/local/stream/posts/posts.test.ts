import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';

describe('LocalStreamPostsService', () => {
  const streamId = Core.PostStreamTypes.TIMELINE_ALL_ALL;
  const DEFAULT_AUTHOR = 'user-1';
  const BASE_TIMESTAMP = 1000000;
  const NON_EXISTENT_STREAM_ID = Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL;

  // ============================================================================
  // Test Helpers
  // ============================================================================

  const buildCompositePostId = (author: string, postId: string) => `${author}:${postId}`;

  const createMockNexusPost = (
    postId: string,
    author: string = DEFAULT_AUTHOR,
    overrides?: Partial<Core.NexusPost>,
  ): Core.NexusPost => ({
    details: {
      id: postId,
      content: `Post ${postId} content`,
      kind: 'short' as const,
      uri: `https://pubky.app/${author}/pub/pubky.app/posts/${postId}`,
      author,
      indexed_at: BASE_TIMESTAMP,
      attachments: null,
      ...overrides?.details,
    },
    counts: {
      replies: 0,
      tags: 0,
      unique_tags: 0,
      reposts: 0,
      ...overrides?.counts,
    },
    tags: overrides?.tags ?? [],
    relationships: {
      replied: null,
      reposted: null,
      mentioned: [],
      ...overrides?.relationships,
    },
    bookmark: null,
    ...overrides,
  });

  const createStream = async (postIds: string[]) => {
    await Core.LocalStreamPostsService.upsert({ streamId, stream: postIds });
  };

  const verifyStream = async (expectedPostIds: string[]) => {
    const result = await Core.PostStreamModel.findById(streamId);
    expect(result).toBeTruthy();
    expect(result!.stream).toEqual(expectedPostIds);
  };

  const verifyStreamDoesNotExist = async () => {
    const result = await Core.PostStreamModel.findById(streamId);
    expect(result).toBeNull();
  };

  const verifyPostPersisted = async (compositePostId: string, expectedContent: string) => {
    const details = await Core.PostDetailsModel.findById(compositePostId);
    expect(details).toBeTruthy();
    expect(details?.content).toBe(expectedContent);

    const counts = await Core.PostCountsModel.findById(compositePostId);
    expect(counts).toBeTruthy();

    const relationships = await Core.PostRelationshipsModel.findById(compositePostId);
    expect(relationships).toBeTruthy();

    const tags = await Core.PostTagsModel.findById(compositePostId);
    expect(tags).toBeTruthy();
  };

  const persistAndVerifyPost = async (postId: string, author: string, overrides?: Partial<Core.NexusPost>) => {
    const mockPost = createMockNexusPost(postId, author, overrides);
    const compositeId = buildCompositePostId(author, postId);

    const result = await Core.LocalStreamPostsService.persistPosts([mockPost]);

    expect(result).toEqual([compositeId]);
    return { compositeId, mockPost };
  };

  beforeEach(async () => {
    // Restore all mocks first to ensure clean state (removes any spies from previous tests)
    vi.restoreAllMocks();
    // Clear all mocks to reset call history
    vi.clearAllMocks();

    // Clear all relevant tables
    await Core.PostStreamModel.table.clear();
    await Core.PostDetailsModel.table.clear();
    await Core.PostCountsModel.table.clear();
    await Core.PostRelationshipsModel.table.clear();
    await Core.PostTagsModel.table.clear();
  });

  describe('upsert', () => {
    it('should create a new stream with post IDs', async () => {
      const postIds = [
        buildCompositePostId('user1', 'post1'),
        buildCompositePostId('user2', 'post2'),
        buildCompositePostId('user3', 'post3'),
      ];

      await Core.LocalStreamPostsService.upsert({ streamId, stream: postIds });

      await verifyStream(postIds);
    });

    it('should update an existing stream with new post IDs', async () => {
      const initialIds = [buildCompositePostId('user1', 'post1'), buildCompositePostId('user2', 'post2')];
      const updatedIds = [...initialIds, buildCompositePostId('user3', 'post3')];

      await createStream(initialIds);
      await Core.LocalStreamPostsService.upsert({ streamId, stream: updatedIds });

      await verifyStream(updatedIds);
    });

    it('should handle empty array', async () => {
      await Core.LocalStreamPostsService.upsert({ streamId, stream: [] });

      await verifyStream([]);
    });

    it('should propagate error when PostStreamModel.upsert throws', async () => {
      // Mock PostStreamModel.upsert to throw database error
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
        'Failed to upsert PostStream',
        500,
        { streamId },
      );
      vi.spyOn(Core.PostStreamModel, 'upsert').mockRejectedValue(databaseError);

      const postIds = [buildCompositePostId('user1', 'post1')];

      await expect(Core.LocalStreamPostsService.upsert({ streamId, stream: postIds })).rejects.toThrow(
        'Failed to upsert PostStream',
      );
    });
  });

  describe('findById', () => {
    it('should return stream when it exists', async () => {
      const postIds = [buildCompositePostId('user1', 'post1'), buildCompositePostId('user2', 'post2')];
      await createStream(postIds);

      const result = await Core.LocalStreamPostsService.findById(streamId);

      expect(result).toBeTruthy();
      expect(result!.stream).toEqual(postIds);
    });

    it('should return null when stream does not exist', async () => {
      const result = await Core.LocalStreamPostsService.findById(NON_EXISTENT_STREAM_ID);

      expect(result).toBeNull();
    });

    it('should propagate error when PostStreamModel.findById throws', async () => {
      // Mock PostStreamModel.findById to throw database error
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        'Database query failed',
        500,
        { streamId },
      );
      vi.spyOn(Core.PostStreamModel, 'findById').mockRejectedValue(databaseError);

      await expect(Core.LocalStreamPostsService.findById(streamId)).rejects.toThrow('Database query failed');
    });
  });

  describe('deleteById', () => {
    it('should delete an existing stream', async () => {
      const postIds = [buildCompositePostId('user1', 'post1'), buildCompositePostId('user2', 'post2')];
      await createStream(postIds);
      await Core.LocalStreamPostsService.deleteById(streamId);
      await verifyStreamDoesNotExist();
    });

    it('should not throw error when deleting non-existent stream', async () => {
      await expect(Core.LocalStreamPostsService.deleteById(NON_EXISTENT_STREAM_ID)).resolves.not.toThrow();
    });

    it('should propagate error when PostStreamModel.deleteById throws', async () => {
      // Mock PostStreamModel.deleteById to throw database error
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        'Failed to delete stream',
        500,
        { streamId },
      );
      vi.spyOn(Core.PostStreamModel, 'deleteById').mockRejectedValue(databaseError);

      await expect(Core.LocalStreamPostsService.deleteById(streamId)).rejects.toThrow('Failed to delete stream');
    });
  });

  describe('persistPosts', () => {
    it('should persist posts and return composite post IDs', async () => {
      const mockPosts: Core.NexusPost[] = [
        createMockNexusPost('post-1', 'user-1'),
        createMockNexusPost('post-2', 'user-2'),
      ];

      const result = await Core.LocalStreamPostsService.persistPosts(mockPosts);

      expect(result).toEqual([buildCompositePostId('user-1', 'post-1'), buildCompositePostId('user-2', 'post-2')]);
      await verifyPostPersisted(buildCompositePostId('user-1', 'post-1'), 'Post post-1 content');
      await verifyPostPersisted(buildCompositePostId('user-2', 'post-2'), 'Post post-2 content');
    });

    it('should handle posts with tags', async () => {
      const mockTag: Core.NexusTag = {
        label: 'tech',
        taggers: ['user-2'],
        taggers_count: 1,
        relationship: true,
      };
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', {
        tags: [new Core.TagModel(mockTag)],
      });

      const postTags = await Core.PostTagsModel.findById(compositeId);
      expect(postTags).toBeTruthy();
      expect(postTags?.tags).toHaveLength(1);
      expect(postTags?.tags[0].label).toBe('tech');
      expect(postTags?.tags[0].taggers).toEqual(['user-2']);
    });

    it('should handle posts with relationships', async () => {
      const repliedUri = 'https://pubky.app/user-2/pub/pubky.app/posts/parent-post';
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', {
        relationships: {
          replied: repliedUri,
          reposted: null,
          mentioned: ['user-3'],
        },
      });

      const relationships = await Core.PostRelationshipsModel.findById(compositeId);
      expect(relationships).toBeTruthy();
      expect(relationships?.replied).toBe(repliedUri);
      expect(relationships?.reposted).toBeNull();
      expect(relationships?.mentioned).toEqual(['user-3']);
    });

    it('should remove author from post details', async () => {
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1');

      const postDetails = await Core.PostDetailsModel.findById(compositeId);
      expect(postDetails).toBeTruthy();
      // Author should not be in details (it's in the composite ID)
      expect((postDetails as unknown as { author?: string }).author).toBeUndefined();
    });

    it('should handle empty array', async () => {
      const result = await Core.LocalStreamPostsService.persistPosts([]);

      expect(result).toEqual([]);
    });

    it('should handle posts with empty tags array', async () => {
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', {
        tags: [],
      });

      const postTags = await Core.PostTagsModel.findById(compositeId);
      expect(postTags).toBeTruthy();
      expect(postTags?.tags).toEqual([]);
    });

    it('should handle posts with multiple tags', async () => {
      const mockTag1: Core.NexusTag = {
        label: 'tech',
        taggers: ['user-2'],
        taggers_count: 1,
        relationship: true,
      };
      const mockTag2: Core.NexusTag = {
        label: 'coding',
        taggers: ['user-3'],
        taggers_count: 1,
        relationship: false,
      };
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', {
        tags: [new Core.TagModel(mockTag1), new Core.TagModel(mockTag2)],
      });

      const postTags = await Core.PostTagsModel.findById(compositeId);
      expect(postTags).toBeTruthy();
      expect(postTags?.tags).toHaveLength(2);
      expect(postTags?.tags[0].label).toBe('tech');
      expect(postTags?.tags[1].label).toBe('coding');
    });

    it('should handle posts with empty mentioned array', async () => {
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', {
        relationships: {
          replied: null,
          reposted: null,
          mentioned: [],
        },
      });

      const relationships = await Core.PostRelationshipsModel.findById(compositeId);
      expect(relationships).toBeTruthy();
      expect(relationships?.mentioned).toEqual([]);
    });

    it('should handle posts with all null relationships', async () => {
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', {
        relationships: {
          replied: null,
          reposted: null,
          mentioned: [],
        },
      });

      const relationships = await Core.PostRelationshipsModel.findById(compositeId);
      expect(relationships).toBeTruthy();
      expect(relationships?.replied).toBeNull();
      expect(relationships?.reposted).toBeNull();
      expect(relationships?.mentioned).toEqual([]);
    });

    it('should propagate error when bulkSave fails', async () => {
      const mockPosts: Core.NexusPost[] = [createMockNexusPost('post-1', 'user-1')];

      // Mock PostDetailsModel.bulkSave to throw error
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.SAVE_FAILED,
        'Failed to save post details',
        500,
        {},
      );
      vi.spyOn(Core.PostDetailsModel, 'bulkSave').mockRejectedValue(databaseError);

      await expect(Core.LocalStreamPostsService.persistPosts(mockPosts)).rejects.toThrow('Failed to save post details');
    });

    it('should handle posts with different authors correctly', async () => {
      const mockPosts: Core.NexusPost[] = [
        createMockNexusPost('post-1', 'author-1'),
        createMockNexusPost('post-2', 'author-2'),
        createMockNexusPost('post-3', 'author-1'),
      ];

      const result = await Core.LocalStreamPostsService.persistPosts(mockPosts);

      expect(result).toEqual([
        buildCompositePostId('author-1', 'post-1'),
        buildCompositePostId('author-2', 'post-2'),
        buildCompositePostId('author-1', 'post-3'),
      ]);

      // Verify all posts were persisted
      await verifyPostPersisted(buildCompositePostId('author-1', 'post-1'), 'Post post-1 content');
      await verifyPostPersisted(buildCompositePostId('author-2', 'post-2'), 'Post post-2 content');
      await verifyPostPersisted(buildCompositePostId('author-1', 'post-3'), 'Post post-3 content');
    });
  });

  describe('persistNewStreamChunk', () => {
    it('should append new stream chunk to existing stream', async () => {
      const initialStream = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'),
      ];
      const newChunk = [buildCompositePostId(DEFAULT_AUTHOR, 'post-3'), buildCompositePostId(DEFAULT_AUTHOR, 'post-4')];

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      await verifyStream([...initialStream, ...newChunk]);
    });

    it('should create stream when it does not exist', async () => {
      const newChunk = [buildCompositePostId(DEFAULT_AUTHOR, 'post-1'), buildCompositePostId(DEFAULT_AUTHOR, 'post-2')];

      // Verify stream doesn't exist
      const beforeStream = await Core.PostStreamModel.findById(NON_EXISTENT_STREAM_ID);
      expect(beforeStream).toBeNull();

      // Persist to non-existent stream - should create it
      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId: NON_EXISTENT_STREAM_ID,
        stream: newChunk,
      });

      // Verify stream was created with the posts
      const afterStream = await Core.PostStreamModel.findById(NON_EXISTENT_STREAM_ID);
      expect(afterStream).not.toBeNull();
      expect(afterStream?.stream).toEqual(newChunk);
    });

    it('should handle appending to empty stream', async () => {
      const newChunk = [buildCompositePostId(DEFAULT_AUTHOR, 'post-1'), buildCompositePostId(DEFAULT_AUTHOR, 'post-2')];

      await createStream([]);
      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      await verifyStream(newChunk);
    });

    it('should handle appending empty chunk', async () => {
      const initialStream = [buildCompositePostId(DEFAULT_AUTHOR, 'post-1')];

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: [],
      });

      await verifyStream(initialStream);
    });

    it('should filter duplicates when appending new chunk', async () => {
      const initialStream = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'),
      ];
      // New chunk contains one duplicate (against existing stream) and one new post
      const newChunk = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'), // Duplicate (exists in initialStream)
        buildCompositePostId(DEFAULT_AUTHOR, 'post-3'), // New
      ];

      // Persist post details first
      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-1', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP },
        }),
        createMockNexusPost('post-2', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-2', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP + 1 },
        }),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-3', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP + 2 },
        }),
      ]);

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      // Should have post-1, post-2, post-3 (post-2 not duplicated against existing stream)
      const result = await Core.PostStreamModel.findById(streamId);
      expect(result?.stream).toHaveLength(3);
      expect(result?.stream).toContain(buildCompositePostId(DEFAULT_AUTHOR, 'post-1'));
      expect(result?.stream).toContain(buildCompositePostId(DEFAULT_AUTHOR, 'post-2'));
      expect(result?.stream).toContain(buildCompositePostId(DEFAULT_AUTHOR, 'post-3'));
    });

    it('should sort stream by timestamp in descending order (most recent first)', async () => {
      // Create initial stream with posts (order doesn't matter, will be sorted)
      const initialStream = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'), // Middle (BASE_TIMESTAMP + 2)
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'), // Older (BASE_TIMESTAMP)
      ];
      const newChunk = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-3'), // Newest (BASE_TIMESTAMP + 5)
      ];

      // Persist post details FIRST with different timestamps (before creating stream)
      // This ensures post details exist when persistNewStreamChunk fetches them
      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-2', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-2', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP + 2 },
        }),
        createMockNexusPost('post-1', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-1', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP },
        }),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-3', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP + 5 },
        }),
      ]);

      // Create stream with initial posts AFTER persisting post details
      await createStream(initialStream);

      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      // Verify posts are in the stream in the correct order
      const result = await Core.PostStreamModel.findById(streamId);
      expect(result?.stream).toHaveLength(3);
      expect(result?.stream).toEqual([
        buildCompositePostId(DEFAULT_AUTHOR, 'post-3'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'),
      ]);
    });

    it('should handle posts with missing timestamps (defaults to 0)', async () => {
      const initialStream = [buildCompositePostId(DEFAULT_AUTHOR, 'post-1')];
      const newChunk = [buildCompositePostId(DEFAULT_AUTHOR, 'post-2')];

      await createStream(initialStream);

      // Persist post-1 with timestamp, post-2 without timestamp (undefined)
      await Core.PostDetailsModel.create({
        id: buildCompositePostId(DEFAULT_AUTHOR, 'post-1'),
        content: 'Post 1',
        kind: 'short',
        indexed_at: BASE_TIMESTAMP,
        uri: `https://pubky.app/${DEFAULT_AUTHOR}/pub/pubky.app/posts/post-1`,
        attachments: null,
      });

      // Post-2 is missing from database (will have timestamp 0)
      // This simulates a post that hasn't been persisted yet

      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      // Post with timestamp should come before post without timestamp (timestamp 0)
      const result = await Core.PostStreamModel.findById(streamId);
      expect(result?.stream).toEqual([
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'), // Has timestamp BASE_TIMESTAMP
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'), // Has timestamp 0 (default)
      ]);
    });

    it('should handle posts with same timestamps (stable sort)', async () => {
      const initialStream = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'),
      ];
      const newChunk = [buildCompositePostId(DEFAULT_AUTHOR, 'post-3'), buildCompositePostId(DEFAULT_AUTHOR, 'post-4')];

      await createStream(initialStream);

      // Persist all posts with the same timestamp
      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-1', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP },
        }),
        createMockNexusPost('post-2', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-2', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP },
        }),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-3', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP },
        }),
        createMockNexusPost('post-4', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-4', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP },
        }),
      ]);

      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      // All posts have same timestamp, so order should be preserved (existing first, then new)
      // Since sorting is stable, order within same timestamp group is preserved
      const result = await Core.PostStreamModel.findById(streamId);
      expect(result?.stream).toHaveLength(4);
      expect(result?.stream).toEqual([
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-3'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-4'),
      ]);
    });

    it('should handle mixed timestamps correctly (some posts newer, some older)', async () => {
      // Initial stream has older posts
      const initialStream = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'), // BASE_TIMESTAMP
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'), // BASE_TIMESTAMP + 1
      ];
      // New chunk has mixed: one newer, one older
      const newChunk = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-3'), // BASE_TIMESTAMP + 5 (newer)
        buildCompositePostId(DEFAULT_AUTHOR, 'post-4'), // BASE_TIMESTAMP - 1 (older)
      ];

      // Persist post details FIRST (before creating stream)
      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-1', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP },
        }),
        createMockNexusPost('post-2', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-2', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP + 1 },
        }),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-3', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP + 5 },
        }),
        createMockNexusPost('post-4', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-4', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP - 1 },
        }),
      ]);

      // Create stream AFTER persisting post details
      await createStream(initialStream);

      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      // Verify all posts are in the stream (sorting behavior verified in implementation)
      const result = await Core.PostStreamModel.findById(streamId);
      expect(result?.stream).toHaveLength(4);
      expect(result?.stream).toEqual([
        buildCompositePostId(DEFAULT_AUTHOR, 'post-3'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-1'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-4'),
      ]);
    });

    it('should handle duplicates within new chunk itself', async () => {
      const initialStream = [buildCompositePostId(DEFAULT_AUTHOR, 'post-1')];
      // New chunk contains duplicates
      // Note: The implementation filters duplicates against the existing stream,
      // but does NOT filter duplicates within the new chunk itself
      const newChunk = [
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'),
        buildCompositePostId(DEFAULT_AUTHOR, 'post-2'), // Duplicate in new chunk
        buildCompositePostId(DEFAULT_AUTHOR, 'post-3'),
      ];

      // Persist post details first
      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-1', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP },
        }),
        createMockNexusPost('post-2', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-2', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP + 1 },
        }),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, {
          details: { ...createMockNexusPost('post-3', DEFAULT_AUTHOR).details, indexed_at: BASE_TIMESTAMP + 2 },
        }),
      ]);

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      // Implementation does NOT filter duplicates within new chunk itself
      // post-2 will appear twice (once for each occurrence in newChunk)
      const result = await Core.PostStreamModel.findById(streamId);
      const post2Count = result?.stream.filter((id) => id === buildCompositePostId(DEFAULT_AUTHOR, 'post-2')).length;
      expect(post2Count).toBe(2); // Duplicates within new chunk are NOT filtered
      expect(result?.stream).toHaveLength(4); // post-1, post-2 (twice), post-3
    });

    it('should propagate error when PostStreamModel.findById throws in persistNewStreamChunk', async () => {
      // Mock PostStreamModel.findById to throw error
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        'Database query failed',
        500,
        { streamId },
      );
      vi.spyOn(Core.PostStreamModel, 'findById').mockRejectedValue(databaseError);

      const newChunk = [buildCompositePostId(DEFAULT_AUTHOR, 'post-1')];

      await expect(
        Core.LocalStreamPostsService.persistNewStreamChunk({
          streamId,
          stream: newChunk,
        }),
      ).rejects.toThrow('Database query failed');
    });

    it('should propagate error when PostDetailsModel.findByIdsPreserveOrder throws', async () => {
      const initialStream = [buildCompositePostId(DEFAULT_AUTHOR, 'post-1')];
      const newChunk = [buildCompositePostId(DEFAULT_AUTHOR, 'post-2')];

      await createStream(initialStream);

      // Mock PostDetailsModel.findByIdsPreserveOrder to throw error
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        'Database query failed',
        500,
        {},
      );
      vi.spyOn(Core.PostDetailsModel, 'findByIdsPreserveOrder').mockRejectedValue(databaseError);

      await expect(
        Core.LocalStreamPostsService.persistNewStreamChunk({
          streamId,
          stream: newChunk,
        }),
      ).rejects.toThrow('Database query failed');
    });

    it('should propagate error when PostStreamModel.upsert throws in persistNewStreamChunk', async () => {
      const initialStream = [buildCompositePostId(DEFAULT_AUTHOR, 'post-1')];
      const newChunk = [buildCompositePostId(DEFAULT_AUTHOR, 'post-2')];

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR),
        createMockNexusPost('post-2', DEFAULT_AUTHOR),
      ]);

      // Mock PostStreamModel.upsert to throw error (after sorting)
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
        'Failed to upsert stream',
        500,
        { streamId },
      );
      vi.spyOn(Core.PostStreamModel, 'upsert').mockRejectedValue(databaseError);

      await expect(
        Core.LocalStreamPostsService.persistNewStreamChunk({
          streamId,
          stream: newChunk,
        }),
      ).rejects.toThrow('Failed to upsert stream');
    });
  });
});
