import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { buildCompositeId } from '@/core';

describe('LocalStreamPostsService', () => {
  const streamId: Core.PostStreamId = Core.PostStreamTypes.TIMELINE_ALL_ALL;
  const DEFAULT_AUTHOR = 'user-1';
  const BASE_TIMESTAMP = 1000000;
  const NON_EXISTENT_STREAM_ID: Core.PostStreamId = Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL;

  // ============================================================================
  // Test Helpers
  // ============================================================================

  const createMockNexusPost = (
    postId: string,
    author: string = DEFAULT_AUTHOR,
    timestamp: number = BASE_TIMESTAMP,
    overrides?: Partial<Core.NexusPost>,
  ): Core.NexusPost => ({
    details: {
      id: postId,
      content: `Post ${postId} content`,
      kind: 'short' as const,
      uri: `https://pubky.app/${author}/pub/pubky.app/posts/${postId}`,
      author,
      indexed_at: timestamp,
      attachments: null,
      ...(overrides?.details as Core.NexusPostDetails | undefined),
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

  const postId = (id: string) => buildCompositeId({ pubky: DEFAULT_AUTHOR, id });

  const createStream = async (postIds: string[]) => {
    await Core.LocalStreamPostsService.upsert({ streamId, stream: postIds });
  };

  const verifyStream = async (expectedPostIds: string[]) => {
    const result = await Core.LocalStreamPostsService.findById(streamId);
    expect(result).toBeTruthy();
    expect(result!.stream).toEqual(expectedPostIds);
  };

  const verifyStreamDoesNotExist = async () => {
    const result = await Core.LocalStreamPostsService.findById(streamId);
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

  const persistAndVerifyPost = async (
    postId: string,
    author: string,
    timestamp: number = BASE_TIMESTAMP,
    overrides?: Partial<Core.NexusPost>,
  ) => {
    const mockPost = createMockNexusPost(postId, author, timestamp, overrides);
    const compositeId = buildCompositeId({ pubky: author, id: postId });

    const result = await Core.LocalStreamPostsService.persistPosts([mockPost]);

    const expectedAttachments = mockPost.details.attachments || [];
    expect(result).toEqual({ postAttachments: expectedAttachments });
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
        buildCompositeId({ pubky: 'user1', id: 'post1' }),
        buildCompositeId({ pubky: 'user2', id: 'post2' }),
        buildCompositeId({ pubky: 'user3', id: 'post3' }),
      ];

      await Core.LocalStreamPostsService.upsert({ streamId, stream: postIds });

      await verifyStream(postIds);
    });

    it('should update an existing stream with new post IDs', async () => {
      const initialIds = [
        buildCompositeId({ pubky: 'user1', id: 'post1' }),
        buildCompositeId({ pubky: 'user2', id: 'post2' }),
      ];
      const updatedIds = [...initialIds, buildCompositeId({ pubky: 'user3', id: 'post3' })];

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

      const postIds = [buildCompositeId({ pubky: 'user1', id: 'post1' })];

      await expect(Core.LocalStreamPostsService.upsert({ streamId, stream: postIds })).rejects.toThrow(
        'Failed to upsert PostStream',
      );
    });
  });

  describe('findById', () => {
    it('should return stream when it exists', async () => {
      const postIds = [
        buildCompositeId({ pubky: 'user1', id: 'post1' }),
        buildCompositeId({ pubky: 'user2', id: 'post2' }),
      ];
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
      const postIds = [
        buildCompositeId({ pubky: 'user1', id: 'post1' }),
        buildCompositeId({ pubky: 'user2', id: 'post2' }),
      ];
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
    it('should persist posts and return post attachments', async () => {
      const mockPosts: Core.NexusPost[] = [
        createMockNexusPost('post-1', 'user-1'),
        createMockNexusPost('post-2', 'user-2'),
      ];

      const result = await Core.LocalStreamPostsService.persistPosts(mockPosts);

      expect(result).toEqual({ postAttachments: [] });
      await verifyPostPersisted(buildCompositeId({ pubky: 'user-1', id: 'post-1' }), 'Post post-1 content');
      await verifyPostPersisted(buildCompositeId({ pubky: 'user-2', id: 'post-2' }), 'Post post-2 content');
    });

    it('should handle posts with tags', async () => {
      const mockTag: Core.NexusTag = {
        label: 'tech',
        taggers: ['user-2'],
        taggers_count: 1,
        relationship: true,
      };
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', BASE_TIMESTAMP, {
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
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', BASE_TIMESTAMP, {
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
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', BASE_TIMESTAMP);

      const postDetails = await Core.PostDetailsModel.findById(compositeId);
      expect(postDetails).toBeTruthy();
      // Author should not be in details (it's in the composite ID)
      expect((postDetails as unknown as { author?: string }).author).toBeUndefined();
    });

    it('should handle empty array', async () => {
      const result = await Core.LocalStreamPostsService.persistPosts([]);

      expect(result).toEqual({ postAttachments: [] });
    });

    it('should handle posts with empty tags array', async () => {
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', BASE_TIMESTAMP, {
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
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', BASE_TIMESTAMP, {
        tags: [new Core.TagModel(mockTag1), new Core.TagModel(mockTag2)],
      });

      const postTags = await Core.PostTagsModel.findById(compositeId);
      expect(postTags).toBeTruthy();
      expect(postTags?.tags).toHaveLength(2);
      expect(postTags?.tags[0].label).toBe('tech');
      expect(postTags?.tags[1].label).toBe('coding');
    });

    it('should handle posts with empty mentioned array', async () => {
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', BASE_TIMESTAMP, {
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
      const { compositeId } = await persistAndVerifyPost('post-1', 'user-1', BASE_TIMESTAMP, {
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

      expect(result).toEqual({ postAttachments: [] });

      // Verify all posts were persisted
      await verifyPostPersisted(buildCompositeId({ pubky: 'author-1', id: 'post-1' }), 'Post post-1 content');
      await verifyPostPersisted(buildCompositeId({ pubky: 'author-2', id: 'post-2' }), 'Post post-2 content');
      await verifyPostPersisted(buildCompositeId({ pubky: 'author-1', id: 'post-3' }), 'Post post-3 content');
    });

    it('should collect and return attachments from posts', async () => {
      const attachment1 = 'https://pubky.app/file1.jpg';
      const attachment2 = 'https://pubky.app/file2.png';
      const attachment3 = 'https://pubky.app/file3.gif';

      const mockPosts: Core.NexusPost[] = [
        createMockNexusPost('post-1', 'user-1', BASE_TIMESTAMP, {
          details: { attachments: [attachment1, attachment2] } as Core.NexusPostDetails,
        }),
        createMockNexusPost('post-2', 'user-2', BASE_TIMESTAMP, {
          details: { attachments: [attachment3] } as Core.NexusPostDetails,
        }),
        createMockNexusPost('post-3', 'user-3', BASE_TIMESTAMP, {
          details: { attachments: null } as Core.NexusPostDetails,
        }),
      ];

      const result = await Core.LocalStreamPostsService.persistPosts(mockPosts);

      expect(result).toEqual({
        postAttachments: [attachment1, attachment2, attachment3],
      });
    });

    it('should handle posts with empty attachments array', async () => {
      const mockPosts: Core.NexusPost[] = [
        createMockNexusPost('post-1', 'user-1', BASE_TIMESTAMP, {
          details: { attachments: [] } as unknown as Core.NexusPostDetails,
        }),
      ];

      const result = await Core.LocalStreamPostsService.persistPosts(mockPosts);

      expect(result).toEqual({ postAttachments: [] });
    });
  });

  describe('persistNewStreamChunk', () => {
    it('should append new stream chunk to existing stream', async () => {
      const initialStream = [postId('post-1'), postId('post-2')];
      const newChunk = [postId('post-3'), postId('post-4')];

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({ streamId, stream: newChunk });

      await verifyStream([...initialStream, ...newChunk]);
    });

    it('should create stream when it does not exist', async () => {
      const newChunk = [postId('post-1'), postId('post-2')];

      expect(await Core.LocalStreamPostsService.findById(NON_EXISTENT_STREAM_ID)).toBeNull();

      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId: NON_EXISTENT_STREAM_ID,
        stream: newChunk,
      });

      const result = await Core.LocalStreamPostsService.findById(NON_EXISTENT_STREAM_ID);
      expect(result?.stream).toEqual(newChunk);
    });

    it('should handle appending to empty stream', async () => {
      const newChunk = [postId('post-1'), postId('post-2')];

      await createStream([]);
      await Core.LocalStreamPostsService.persistNewStreamChunk({ streamId, stream: newChunk });

      await verifyStream(newChunk);
    });

    it('should handle appending empty chunk', async () => {
      const initialStream = [postId('post-1')];

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({ streamId, stream: [] });

      await verifyStream(initialStream);
    });

    it('should filter duplicates when appending new chunk', async () => {
      const initialStream = [postId('post-1'), postId('post-2')];
      const newChunk = [postId('post-2'), postId('post-3')];

      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR, BASE_TIMESTAMP),
        createMockNexusPost('post-2', DEFAULT_AUTHOR, BASE_TIMESTAMP + 1),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, BASE_TIMESTAMP + 2),
      ]);

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      const result = await Core.LocalStreamPostsService.findById(streamId);
      expect(result?.stream).toHaveLength(3);
      expect(result?.stream).toContain(postId('post-1'));
      expect(result?.stream).toContain(postId('post-2'));
      expect(result?.stream).toContain(postId('post-3'));
    });

    it('should sort stream by timestamp in descending order (most recent first)', async () => {
      const initialStream = [postId('post-2'), postId('post-1')];
      const newChunk = [postId('post-3')];

      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-2', DEFAULT_AUTHOR, BASE_TIMESTAMP + 2),
        createMockNexusPost('post-1', DEFAULT_AUTHOR, BASE_TIMESTAMP),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, BASE_TIMESTAMP + 5),
      ]);

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({ streamId, stream: newChunk });

      const result = await Core.LocalStreamPostsService.findById(streamId);
      expect(result?.stream).toEqual([postId('post-3'), postId('post-2'), postId('post-1')]);
    });

    it('should handle posts with missing timestamps (defaults to 0)', async () => {
      const initialStream = [postId('post-1')];
      const newChunk = [postId('post-2')];

      await createStream(initialStream);
      await Core.PostDetailsModel.create({
        id: postId('post-1'),
        content: 'Post 1',
        kind: 'short',
        indexed_at: BASE_TIMESTAMP,
        uri: `https://pubky.app/${DEFAULT_AUTHOR}/pub/pubky.app/posts/post-1`,
        attachments: null,
      });

      await Core.LocalStreamPostsService.persistNewStreamChunk({ streamId, stream: newChunk });

      const result = await Core.LocalStreamPostsService.findById(streamId);
      expect(result?.stream).toEqual([postId('post-1'), postId('post-2')]);
    });

    it('should handle posts with same timestamps (stable sort)', async () => {
      const initialStream = [postId('post-1'), postId('post-2')];
      const newChunk = [postId('post-3'), postId('post-4')];

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR, BASE_TIMESTAMP),
        createMockNexusPost('post-2', DEFAULT_AUTHOR, BASE_TIMESTAMP),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, BASE_TIMESTAMP),
        createMockNexusPost('post-4', DEFAULT_AUTHOR, BASE_TIMESTAMP),
      ]);

      await Core.LocalStreamPostsService.persistNewStreamChunk({ streamId, stream: newChunk });

      const result = await Core.LocalStreamPostsService.findById(streamId);
      expect(result?.stream).toEqual([postId('post-1'), postId('post-2'), postId('post-3'), postId('post-4')]);
    });

    it('should handle mixed timestamps correctly (some posts newer, some older)', async () => {
      const initialStream = [postId('post-1'), postId('post-2')];
      const newChunk = [postId('post-3'), postId('post-4')];

      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR, BASE_TIMESTAMP),
        createMockNexusPost('post-2', DEFAULT_AUTHOR, BASE_TIMESTAMP + 1),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, BASE_TIMESTAMP + 5),
        createMockNexusPost('post-4', DEFAULT_AUTHOR, BASE_TIMESTAMP - 1),
      ]);

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({ streamId, stream: newChunk });

      const result = await Core.LocalStreamPostsService.findById(streamId);
      expect(result?.stream).toEqual([postId('post-3'), postId('post-2'), postId('post-1'), postId('post-4')]);
    });

    it('should handle duplicates within new chunk itself', async () => {
      const initialStream = [postId('post-1')];
      const newChunk = [postId('post-2'), postId('post-2'), postId('post-3')];

      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR, BASE_TIMESTAMP),
        createMockNexusPost('post-2', DEFAULT_AUTHOR, BASE_TIMESTAMP + 1),
        createMockNexusPost('post-3', DEFAULT_AUTHOR, BASE_TIMESTAMP + 2),
      ]);

      await createStream(initialStream);
      await Core.LocalStreamPostsService.persistNewStreamChunk({ streamId, stream: newChunk });

      const result = await Core.LocalStreamPostsService.findById(streamId);
      expect(result?.stream.filter((id) => id === postId('post-2')).length).toBe(2);
      expect(result?.stream).toHaveLength(4);
    });

    it('should propagate error when PostStreamModel.findById throws in persistNewStreamChunk', async () => {
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.QUERY_FAILED,
        'Database query failed',
        500,
        { streamId },
      );
      vi.spyOn(Core.PostStreamModel, 'findById').mockRejectedValue(databaseError);

      await expect(
        Core.LocalStreamPostsService.persistNewStreamChunk({
          streamId,
          stream: [postId('post-1')],
        }),
      ).rejects.toThrow('Database query failed');
    });

    it('should propagate error when PostDetailsModel.findByIdsPreserveOrder throws', async () => {
      await createStream([postId('post-1')]);

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
          stream: [postId('post-2')],
        }),
      ).rejects.toThrow('Database query failed');
    });

    it('should propagate error when PostStreamModel.upsert throws in persistNewStreamChunk', async () => {
      await createStream([postId('post-1')]);
      await Core.LocalStreamPostsService.persistPosts([
        createMockNexusPost('post-1', DEFAULT_AUTHOR),
        createMockNexusPost('post-2', DEFAULT_AUTHOR),
      ]);

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
          stream: [postId('post-2')],
        }),
      ).rejects.toThrow('Failed to upsert stream');
    });
  });
});
