import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('LocalStreamPostsService', () => {
  const streamId = Core.PostStreamTypes.TIMELINE_ALL;
  const DEFAULT_AUTHOR = 'user-1';
  const BASE_TIMESTAMP = 1000000;
  const NON_EXISTENT_STREAM_ID = Core.PostStreamTypes.TIMELINE_FOLLOWING;

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

    it('should throw error when stream does not exist', async () => {
      await expect(
        Core.LocalStreamPostsService.persistNewStreamChunk({
          streamId: NON_EXISTENT_STREAM_ID,
          stream: [buildCompositePostId(DEFAULT_AUTHOR, 'post-1')],
        }),
      ).rejects.toThrow(`Post stream not found: ${NON_EXISTENT_STREAM_ID}`);
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
  });
});
