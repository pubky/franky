import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Core from '@/core';

describe('PostStreamApplication', () => {
  const streamId = Core.PostStreamTypes.TIMELINE_ALL_ALL as Core.PostStreamId;
  const DEFAULT_AUTHOR = 'user-1';
  const BASE_TIMESTAMP = 1000000;

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
      ...overrides?.details,
    },
    counts: {
      replies: 0,
      tags: 0,
      unique_tags: 0,
      reposts: 0,
      ...overrides?.counts,
    },
    tags: [],
    relationships: {
      replied: null,
      reposted: null,
      mentioned: [],
      ...overrides?.relationships,
    },
    bookmark: null,
    ...overrides,
  });

  const createMockNexusPosts = (
    count: number,
    startIndex: number = 1,
    author: string = DEFAULT_AUTHOR,
    startTimestamp: number = BASE_TIMESTAMP,
  ): Core.NexusPost[] => {
    return Array.from({ length: count }, (_, i) => {
      const postId = `post-${startIndex + i}`;
      return createMockNexusPost(postId, author, startTimestamp + i);
    });
  };

  const createMockNexusPostsKeyStream = (
    count: number,
    startIndex: number = 1,
    author: string = DEFAULT_AUTHOR,
    startTimestamp: number = BASE_TIMESTAMP,
  ): Core.NexusPostsKeyStream => {
    const postKeys = Array.from({ length: count }, (_, i) => `${author}:post-${startIndex + i}`);
    const lastPostScore = startTimestamp + count - 1;
    return {
      post_keys: postKeys,
      last_post_score: lastPostScore,
    };
  };

  const createMockNexusUser = (
    userId: string = DEFAULT_AUTHOR,
    overrides?: Partial<Core.NexusUser>,
  ): Core.NexusUser => ({
    details: {
      id: userId,
      name: `User ${userId}`,
      bio: 'Bio',
      links: null,
      status: null,
      image: null,
      indexed_at: BASE_TIMESTAMP,
      ...overrides?.details,
    },
    counts: {
      tagged: 0,
      tags: 0,
      unique_tags: 0,
      posts: 0,
      replies: 0,
      following: 0,
      followers: 0,
      friends: 0,
      bookmarks: 0,
      ...overrides?.counts,
    },
    tags: [],
    relationship: {
      following: false,
      followed_by: false,
      muted: false,
      ...overrides?.relationship,
    },
    ...overrides,
  });

  const createPostDetails = async (postIds: string[], startTimestamp: number = BASE_TIMESTAMP) => {
    return Promise.all(
      postIds.map((postId, i) =>
        Core.PostDetailsModel.create({
          id: postId,
          content: `Content for ${postId}`,
          kind: 'short',
          indexed_at: startTimestamp + i,
          uri: `https://pubky.app/${DEFAULT_AUTHOR}/pub/pubky.app/posts/post-${i + 1}`,
          attachments: null,
        }),
      ),
    );
  };

  const createStreamWithPosts = async (postIds: string[]) => {
    await Core.PostStreamModel.create(streamId, postIds);
  };

  const expectPostIds = (result: string[], start: number, count: number, author = DEFAULT_AUTHOR) => {
    const expected = Array.from({ length: count }, (_, i) => `${author}:post-${start + i}`);
    expect(result).toEqual(expected);
  };

  const createTestData = (postCount = 1, author = DEFAULT_AUTHOR) => ({
    cacheMissPostIds: Array.from({ length: postCount }, (_, i) => `${author}:post-${i + 1}`),
    mockNexusPosts: createMockNexusPosts(postCount, 1, author),
  });

  const setupDefaultMocks = () => ({
    persistPosts: vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue({ postAttachments: [] }),
    fetchFiles: vi.spyOn(Core.FileApplication, 'fetchFiles').mockResolvedValue(undefined),
    getUserDetails: vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder'),
  });

  const mockAllUsersCached = (count = 1, author = DEFAULT_AUTHOR) => {
    return Array.from({ length: count }, () => ({ id: author }) as Core.UserDetailsModelSchema);
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    await Core.PostStreamModel.table.clear();
    await Core.UnreadPostStreamModel.table.clear();
    await Core.PostDetailsModel.table.clear();
    await Core.UserDetailsModel.table.clear();
    await Core.UserCountsModel.table.clear();
    await Core.UserRelationshipsModel.table.clear();
    await Core.UserTagsModel.table.clear();
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Tests
  // ============================================================================

  describe('getOrFetchStreamSlice', () => {
    it('should return posts from cache when available (no cursor)', async () => {
      const postIds = Array.from({ length: 20 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        streamTail: 0,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(result.nextPageIds).toHaveLength(10);
      expect(result.nextPageIds).toEqual(postIds.slice(0, 10));
      expect(result.cacheMissPostIds).toEqual([]);
      expect(result.timestamp).toBeUndefined();
    });

    it('should fetch from Nexus when cache is empty', async () => {
      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);
      await createStreamWithPosts([]);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        streamTail: 0,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(result.nextPageIds).toHaveLength(5);
      expectPostIds(result.nextPageIds, 1, 5);
      expect(result.timestamp).toBe(BASE_TIMESTAMP + 4);
      expect(result.cacheMissPostIds).toHaveLength(5);
      expect(result.cacheMissPostIds).toEqual(result.nextPageIds);

      const cached = await Core.PostStreamModel.findById(streamId);
      expect(cached?.stream).toEqual(result.nextPageIds);
    });

    it('should paginate using cursor (post_id and timestamp)', async () => {
      const initialPostIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(initialPostIds);
      await createPostDetails(initialPostIds);

      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        lastPostId: `${DEFAULT_AUTHOR}:post-5`,
        streamTail: BASE_TIMESTAMP + 4,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(result.nextPageIds).toHaveLength(5);
      expectPostIds(result.nextPageIds, 6, 5);
      expect(result.timestamp).toBe(BASE_TIMESTAMP + 9);

      const cached = await Core.PostStreamModel.findById(streamId);
      expect(cached?.stream).toHaveLength(10);
    });

    it('should return empty array when no more posts available', async () => {
      const postIds = [`${DEFAULT_AUTHOR}:post-1`, `${DEFAULT_AUTHOR}:post-2`];
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue({
        post_keys: [],
        last_post_score: 0,
      });

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        lastPostId: `${DEFAULT_AUTHOR}:post-2`,
        streamHead: 0,
        streamTail: BASE_TIMESTAMP + 1,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(result.nextPageIds).toHaveLength(0);
      expect(result.cacheMissPostIds).toEqual([]);
    });

    it('should fetch from Nexus when cache has insufficient posts and combine results', async () => {
      // Create cache with only 3 posts (less than limit of 10)
      const cachedPostIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(cachedPostIds);
      await createPostDetails(cachedPostIds);

      // Mock more posts from Nexus
      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5, 4, DEFAULT_AUTHOR, BASE_TIMESTAMP + 3);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      // Request 10 posts, but cache only has 3
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamTail: 0,
        streamHead: 0,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      // Should combine cached posts (3) + fetched posts (5) = 8 total
      expect(result.nextPageIds).toHaveLength(8);
      // First 3 should be from cache
      expectPostIds(result.nextPageIds.slice(0, 3), 1, 3);
      // Next 5 should be from Nexus
      expectPostIds(result.nextPageIds.slice(3, 8), 4, 5);
    });

    it('should handle error when getting timestamp from post ID', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);

      vi.spyOn(Core.PostDetailsModel, 'findById').mockRejectedValue(new Error('Database error'));
      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        lastPostId: `${DEFAULT_AUTHOR}:post-5`,
        streamTail: BASE_TIMESTAMP + 4,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(result.nextPageIds).toHaveLength(5);
    });

    it('should handle when cache has exactly limit number of posts', async () => {
      const postIds = Array.from({ length: 10 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch');

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamTail: 0,
        streamHead: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(10);
      expect(result.nextPageIds).toEqual(postIds);
      expect(result.cacheMissPostIds).toEqual([]);
      expect(result.timestamp).toBeUndefined();
      // Full cache hit should not fetch from Nexus
      expect(nexusFetchSpy).not.toHaveBeenCalled();
    });

    it('should handle when cache has posts but not enough after post_id', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        lastPostId: `${DEFAULT_AUTHOR}:post-3`,
        streamTail: BASE_TIMESTAMP + 2,
        viewerId: DEFAULT_AUTHOR,
      });

      // Cache has 2 posts after post-3: [post-4, post-5]
      // Fetches 5 more from Nexus: [post-6, post-7, post-8, post-9, post-10]
      // Total: 7 posts (2 cached + 5 fetched)
      expect(result.nextPageIds).toHaveLength(7);
      // First 2 should be from cache
      expectPostIds(result.nextPageIds.slice(0, 2), 4, 2);
      // Next 5 should be from Nexus
      expectPostIds(result.nextPageIds.slice(2, 7), 6, 5);
    });

    it('should propagate error when NexusPostStreamService.fetch fails', async () => {
      await createStreamWithPosts([]);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(
        Core.PostStreamApplication.getOrFetchStreamSlice({
          streamId,
          limit: 10,
          streamTail: 0,
          streamHead: 0,
          viewerId: DEFAULT_AUTHOR,
        }),
      ).rejects.toThrow('Network error');
    });

    it('should propagate error when persistNewStreamChunk fails (stream write operation)', async () => {
      await createStreamWithPosts([]);
      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);
      vi.spyOn(Core.LocalStreamPostsService, 'persistNewStreamChunk').mockRejectedValue(
        new Error('Failed to persist stream chunk'),
      );

      await expect(
        Core.PostStreamApplication.getOrFetchStreamSlice({
          streamId,
          limit: 10,
          streamTail: 0,
          streamHead: 0,
          viewerId: DEFAULT_AUTHOR,
        }),
      ).rejects.toThrow('Failed to persist stream chunk');
    });

    it('should propagate error when getNotPersistedPostsInCache fails (post details read operation)', async () => {
      await createStreamWithPosts([]);
      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);
      vi.spyOn(Core.LocalStreamPostsService, 'persistNewStreamChunk').mockResolvedValue(undefined);

      const findByIdsSpy = vi
        .spyOn(Core.PostDetailsModel, 'findByIdsPreserveOrder')
        .mockRejectedValue(new Error('Database query failed'));

      await expect(
        Core.PostStreamApplication.getOrFetchStreamSlice({
          streamId,
          limit: 10,
          streamTail: 0,
          streamHead: 0,
          viewerId: DEFAULT_AUTHOR,
        }),
      ).rejects.toThrow('Database query failed');

      findByIdsSpy.mockRestore();
    });

    it('should handle posts with different authors', async () => {
      await createStreamWithPosts([]);
      const mockNexusPostsKeyStream: Core.NexusPostsKeyStream = {
        post_keys: ['author-1:post-1', 'author-2:post-2', 'author-1:post-3'],
        last_post_score: BASE_TIMESTAMP + 2,
      };
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);
      vi.spyOn(Core.PostDetailsModel, 'findByIdsPreserveOrder').mockResolvedValue(Array(3).fill(undefined));

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamTail: 0,
        streamHead: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(3);
      expect(result.nextPageIds).toEqual(['author-1:post-1', 'author-2:post-2', 'author-1:post-3']);
    });

    it('should handle when limit is 0', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue({
        post_keys: [],
        last_post_score: 0,
      });

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 0,
        streamHead: 0,
        streamTail: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(0);
      expect(result.cacheMissPostIds).toEqual([]);
      expect(result.timestamp).toBeUndefined();
      // Note: When limit is 0, getStreamFromCache returns empty immediately and doesn't fetch from Nexus
      expect(nexusFetchSpy).not.toHaveBeenCalled();
    });

    it('should handle when timestamp is provided but post_id is not', async () => {
      await createStreamWithPosts([]);
      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);
      vi.spyOn(Core.PostDetailsModel, 'findByIdsPreserveOrder').mockResolvedValue(Array(5).fill(undefined));

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        streamTail: BASE_TIMESTAMP,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(5);
    });

    it('should force streamTail to 0 on initial load with empty cache', async () => {
      await createStreamWithPosts([]);
      const staleStreamTail = BASE_TIMESTAMP + 100;
      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5);
      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        streamTail: staleStreamTail,
        lastPostId: undefined, // Initial load
        viewerId: DEFAULT_AUTHOR,
      });

      // Should fetch from beginning (streamTail reset to 0)
      expect(nexusFetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.not.objectContaining({
            start: expect.anything(),
          }),
        }),
      );
      expect(result.nextPageIds).toHaveLength(5);
    });

    it('should skip cache check for engagement streams', async () => {
      const engagementStreamId = `${Core.StreamSorting.ENGAGEMENT}:all:all` as Core.PostStreamId;
      const postIds = Array.from({ length: 10 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      // Create cache for engagement stream
      await Core.PostStreamModel.create(engagementStreamId, postIds);
      await createPostDetails(postIds);

      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5);
      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId: engagementStreamId,
        limit: 10,
        streamHead: 0,
        streamTail: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      // Should fetch from Nexus even though cache exists
      expect(nexusFetchSpy).toHaveBeenCalled();
      expect(result.nextPageIds).toHaveLength(5);
      // Should not return cached posts (should return fetched posts from Nexus)
      expectPostIds(result.nextPageIds, 1, 5);
    });

    it('should fallback to Nexus when cachedStream exists but getStreamFromCache returns empty', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      // lastPostId not found in cache
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        lastPostId: `${DEFAULT_AUTHOR}:post-999`, // Not in cache
        streamTail: BASE_TIMESTAMP + 999,
        viewerId: DEFAULT_AUTHOR,
      });

      // Should fallback to Nexus fetch
      expect(nexusFetchSpy).toHaveBeenCalled();
      expect(result.nextPageIds).toHaveLength(5);
      expectPostIds(result.nextPageIds, 6, 5);
    });

    it('should deduplicate when fetched posts overlap with cached posts', async () => {
      // Cache has 3 posts: [post-1, post-2, post-3]
      const cachedPostIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(cachedPostIds);
      await createPostDetails(cachedPostIds);

      // Nexus returns posts that overlap with cache: [post-3, post-4, post-5]
      // post-3 is already in cache, so it should be deduplicated
      const mockNexusPostsKeyStream: Core.NexusPostsKeyStream = {
        post_keys: [
          `${DEFAULT_AUTHOR}:post-3`, // Overlap with cache
          `${DEFAULT_AUTHOR}:post-4`,
          `${DEFAULT_AUTHOR}:post-5`,
        ],
        last_post_score: BASE_TIMESTAMP + 4,
      };
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 5,
        streamTail: 0,
        streamHead: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      // Should have 5 unique posts: [post-1, post-2, post-3, post-4, post-5]
      // post-3 should not be duplicated
      expect(result.nextPageIds).toHaveLength(5);
      expect(result.nextPageIds).toEqual([
        `${DEFAULT_AUTHOR}:post-1`,
        `${DEFAULT_AUTHOR}:post-2`,
        `${DEFAULT_AUTHOR}:post-3`,
        `${DEFAULT_AUTHOR}:post-4`,
        `${DEFAULT_AUTHOR}:post-5`,
      ]);
      // Verify no duplicates
      expect(new Set(result.nextPageIds).size).toBe(5);
    });

    it('should handle error when getting timestamp from last cached post fails', async () => {
      // Cache has 3 posts: [post-1, post-2, post-3]
      const cachedPostIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(cachedPostIds);
      await createPostDetails(cachedPostIds);

      // Mock error when getting last post details
      vi.spyOn(Core.PostDetailsModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5, 4, DEFAULT_AUTHOR, BASE_TIMESTAMP + 3);
      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        streamTail: BASE_TIMESTAMP + 100, // Original streamTail
        viewerId: DEFAULT_AUTHOR,
      });

      // Should still fetch and combine successfully
      // Should use original streamTail when error occurs
      expect(nexusFetchSpy).toHaveBeenCalled();
      expect(result.nextPageIds).toHaveLength(8); // 3 cached + 5 fetched
      // First 3 should be from cache
      expectPostIds(result.nextPageIds.slice(0, 3), 1, 3);
      // Next 5 should be from Nexus
      expectPostIds(result.nextPageIds.slice(3, 8), 4, 5);
    });

    it('should combine cached + fetched posts correctly with proper order and completeness', async () => {
      // Cache has 2 posts: [post-1, post-2]
      const cachedPostIds = Array.from({ length: 2 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(cachedPostIds);
      await createPostDetails(cachedPostIds);

      // Request 5 posts, cache has 2, so fetch 3 more
      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(3, 3, DEFAULT_AUTHOR, BASE_TIMESTAMP + 2);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 5,
        streamHead: 0,
        streamTail: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      // Should combine: 2 cached + 3 fetched = 5 total
      expect(result.nextPageIds).toHaveLength(5);
      // Verify order: cached posts first, then fetched posts
      expect(result.nextPageIds).toEqual([
        `${DEFAULT_AUTHOR}:post-1`,
        `${DEFAULT_AUTHOR}:post-2`,
        `${DEFAULT_AUTHOR}:post-3`,
        `${DEFAULT_AUTHOR}:post-4`,
        `${DEFAULT_AUTHOR}:post-5`,
      ]);
      // Verify completeness: all posts are present
      expectPostIds(result.nextPageIds.slice(0, 2), 1, 2); // Cached
      expectPostIds(result.nextPageIds.slice(2, 5), 3, 3); // Fetched
    });

    it('should return empty array when lastPostId is at end of cache', async () => {
      // Cache has 5 posts: [post-1, post-2, post-3, post-4, post-5]
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      // lastPostId is the last post in cache (post-5)
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        lastPostId: `${DEFAULT_AUTHOR}:post-5`, // Last post in cache
        streamTail: BASE_TIMESTAMP + 4,
        viewerId: DEFAULT_AUTHOR,
      });

      // getStreamFromCache should return empty (no posts after lastPostId)
      // Should fallback to Nexus fetch
      expect(nexusFetchSpy).toHaveBeenCalled();
      expect(result.nextPageIds).toHaveLength(5);
      expectPostIds(result.nextPageIds, 6, 5);
    });

    it('should return partial cache when fewer posts than limit (no lastPostId)', async () => {
      // Cache has only 3 posts, but request limit is 10
      const postIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const mockNexusPostsKeyStream = createMockNexusPostsKeyStream(7, 4, DEFAULT_AUTHOR, BASE_TIMESTAMP + 3);
      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPostsKeyStream);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamHead: 0,
        streamTail: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      // getStreamFromCache should return all 3 cached posts (fewer than limit)
      // Should trigger partial cache hit and fetch remaining 7 from Nexus
      // Result should be 3 cached + 7 fetched = 10 total
      expect(nexusFetchSpy).toHaveBeenCalled();
      expect(result.nextPageIds).toHaveLength(10);
      // First 3 should be from cache
      expectPostIds(result.nextPageIds.slice(0, 3), 1, 3);
      // Next 7 should be from Nexus
      expectPostIds(result.nextPageIds.slice(3, 10), 4, 7);
    });
  });

  describe('getCachedLastPostTimestamp', () => {
    it('should return 0 when stream does not exist', async () => {
      const result = await Core.PostStreamApplication.getCachedLastPostTimestamp({ streamId });

      expect(result).toBe(0);
    });

    it('should return 0 when stream is empty', async () => {
      await createStreamWithPosts([]);

      const result = await Core.PostStreamApplication.getCachedLastPostTimestamp({ streamId });

      expect(result).toBe(0);
    });

    it('should return timestamp of last post with details', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const result = await Core.PostStreamApplication.getCachedLastPostTimestamp({ streamId });

      // Last post is post-5, which has timestamp BASE_TIMESTAMP + 4
      expect(result).toBe(BASE_TIMESTAMP + 4);
    });

    it('should iterate backwards when last post has no details', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      // Only create details for first 3 posts (post-1, post-2, post-3)
      await createPostDetails(postIds.slice(0, 3));

      const result = await Core.PostStreamApplication.getCachedLastPostTimestamp({ streamId });

      // Should find post-3 (3rd from end), which has timestamp BASE_TIMESTAMP + 2
      expect(result).toBe(BASE_TIMESTAMP + 2);
    });

    it('should return 0 when no posts have details', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      // Don't create any post details

      const result = await Core.PostStreamApplication.getCachedLastPostTimestamp({ streamId });

      expect(result).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      vi.spyOn(Core.PostStreamModel, 'findById').mockRejectedValue(new Error('Database error'));

      const result = await Core.PostStreamApplication.getCachedLastPostTimestamp({ streamId });

      expect(result).toBe(0);
    });
  });

  describe('fetchMissingPostsFromNexus', () => {
    const viewerId = 'user-viewer' as Core.Pubky;

    it('should fetch and persist posts when postBatch exists', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(2);
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue(mockAllUsersCached(2));

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusPosts);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(queryNexusSpy).toHaveBeenCalledWith(
        expect.stringContaining('/stream/posts/by_ids'),
        'POST',
        expect.stringContaining(JSON.stringify({ post_ids: cacheMissPostIds, viewer_id: viewerId })),
      );
      expect(mocks.persistPosts).toHaveBeenCalledWith({ posts: mockNexusPosts });
      expect(mocks.fetchFiles).toHaveBeenCalledWith([]);
    });

    it('should fetch and persist users when cacheMissUserIds exist', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      const mockNexusUsers = [createMockNexusUser(DEFAULT_AUTHOR)];
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue([undefined]);

      const queryNexusSpy = vi
        .spyOn(Core, 'queryNexus')
        .mockResolvedValueOnce(mockNexusPosts)
        .mockResolvedValueOnce(mockNexusUsers);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(queryNexusSpy).toHaveBeenCalledTimes(2);
      expect(queryNexusSpy).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/stream/users/by_ids'),
        'POST',
        expect.stringContaining(JSON.stringify({ user_ids: [DEFAULT_AUTHOR], viewer_id: viewerId })),
      );
      expect(persistUsersSpy).toHaveBeenCalledWith(mockNexusUsers);
    });

    it('should handle when userBatch is null/undefined', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue([undefined]);

      vi.spyOn(Core, 'queryNexus')
        .mockResolvedValueOnce(mockNexusPosts)
        .mockResolvedValueOnce(undefined as unknown as Core.NexusUser[]);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(persistUsersSpy).toHaveBeenCalledWith(undefined);
    });

    it('should not fetch users when all users are already cached', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue(mockAllUsersCached(1));

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusPosts);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(queryNexusSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle when cacheMissPostIds is empty array', async () => {
      const cacheMissPostIds: string[] = [];
      const mocks = setupDefaultMocks();

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([]);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(queryNexusSpy).toHaveBeenCalledWith(
        expect.stringContaining('/stream/posts/by_ids'),
        'POST',
        expect.stringContaining(JSON.stringify({ post_ids: [], viewer_id: viewerId })),
      );
      expect(mocks.persistPosts).toHaveBeenCalledWith({ posts: [] });
    });

    it('should handle when postBatch is empty array', async () => {
      const { cacheMissPostIds } = createTestData(1);
      const mocks = setupDefaultMocks();

      vi.spyOn(Core, 'queryNexus').mockResolvedValue([]);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(mocks.persistPosts).toHaveBeenCalledWith({ posts: [] });
    });

    it('should handle when userBatch is empty array', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue([undefined]);

      vi.spyOn(Core, 'queryNexus').mockResolvedValueOnce(mockNexusPosts).mockResolvedValueOnce([]);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(persistUsersSpy).toHaveBeenCalledWith([]);
    });

    it('should handle error gracefully when queryNexus fails for posts', async () => {
      const { cacheMissPostIds } = createTestData(1);
      vi.spyOn(Core, 'queryNexus').mockRejectedValue(new Error('Network error'));

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(Core.queryNexus).toHaveBeenCalled();
    });

    it('should handle error gracefully when persistPosts fails', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockRejectedValue(new Error('Failed to persist posts'));

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(Core.LocalStreamPostsService.persistPosts).toHaveBeenCalled();
    });

    it('should handle error gracefully when file persistence fails', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      const mockAttachments = [
        'pubky://user-1/pub/pubky.app/files/file-1',
        'pubky://user-1/pub/pubky.app/files/file-2',
      ];

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue({
        postAttachments: mockAttachments,
      });
      const fetchFilesSpy = vi
        .spyOn(Core.FileApplication, 'fetchFiles')
        .mockRejectedValue(new Error('Failed to persist files'));

      const getUserDetailsSpy = vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder');
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(fetchFilesSpy).toHaveBeenCalledWith(mockAttachments);
      expect(queryNexusSpy).toHaveBeenCalledTimes(1);
      expect(getUserDetailsSpy).not.toHaveBeenCalled();
      expect(persistUsersSpy).not.toHaveBeenCalled();
    });

    it('should handle error gracefully when queryNexus fails for users', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue([undefined]);

      vi.spyOn(Core, 'queryNexus')
        .mockResolvedValueOnce(mockNexusPosts)
        .mockRejectedValueOnce(new Error('Network error fetching users'));

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(Core.queryNexus).toHaveBeenCalledTimes(2);
    });

    it('should handle error gracefully when persistUsers fails', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      const mockNexusUsers = [createMockNexusUser(DEFAULT_AUTHOR)];
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue([undefined]);

      vi.spyOn(Core, 'queryNexus').mockResolvedValueOnce(mockNexusPosts).mockResolvedValueOnce(mockNexusUsers);

      vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockRejectedValue(new Error('Failed to persist users'));

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(Core.LocalStreamUsersService.persistUsers).toHaveBeenCalled();
    });

    it('should handle multiple posts with same author', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(2);
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue(mockAllUsersCached(2));

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusPosts);
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(queryNexusSpy).toHaveBeenCalledTimes(1);
      expect(persistUsersSpy).not.toHaveBeenCalled();
    });

    it('should handle posts with different authors', async () => {
      const cacheMissPostIds = [`author-1:post-1`, `author-2:post-2`];
      const mockNexusPosts: Core.NexusPost[] = [
        createMockNexusPost('post-1', 'author-1', BASE_TIMESTAMP),
        createMockNexusPost('post-2', 'author-2', BASE_TIMESTAMP + 1),
      ];
      const mockNexusUsers = [createMockNexusUser('author-1'), createMockNexusUser('author-2')];
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue([undefined, undefined]);

      const queryNexusSpy = vi
        .spyOn(Core, 'queryNexus')
        .mockResolvedValueOnce(mockNexusPosts)
        .mockResolvedValueOnce(mockNexusUsers);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(queryNexusSpy).toHaveBeenCalledTimes(2);
      expect(persistUsersSpy).toHaveBeenCalledWith(mockNexusUsers);
    });

    it('should handle when getNotPersistedUsersInCache returns partial users', async () => {
      const cacheMissPostIds = [`author-1:post-1`, `author-2:post-2`];
      const mockNexusPosts: Core.NexusPost[] = [
        createMockNexusPost('post-1', 'author-1', BASE_TIMESTAMP),
        createMockNexusPost('post-2', 'author-2', BASE_TIMESTAMP + 1),
      ];
      const mockNexusUsers = [createMockNexusUser('author-2')];
      const mocks = setupDefaultMocks();
      mocks.getUserDetails.mockResolvedValue([{ id: 'author-1' } as Core.UserDetailsModelSchema, undefined]);

      const queryNexusSpy = vi
        .spyOn(Core, 'queryNexus')
        .mockResolvedValueOnce(mockNexusPosts)
        .mockResolvedValueOnce(mockNexusUsers);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue([]);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(queryNexusSpy).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/stream/users/by_ids'),
        'POST',
        expect.stringContaining(JSON.stringify({ user_ids: ['author-2'], viewer_id: viewerId })),
      );
      expect(persistUsersSpy).toHaveBeenCalledWith(mockNexusUsers);
    });

    it('should handle error gracefully when getNotPersistedUsersInCache fails', async () => {
      const { cacheMissPostIds, mockNexusPosts } = createTestData(1);
      setupDefaultMocks();

      vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder').mockRejectedValue(new Error('Database query failed'));

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(Core.UserDetailsModel.findByIdsPreserveOrder).toHaveBeenCalled();
    });
  });

  describe('getStreamHead', () => {
    it('should return stream head timestamp when stream exists with posts', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const result = await Core.PostStreamApplication.getStreamHead({ streamId });

      // Should return the timestamp of the first post (head of stream)
      expect(result).toBe(BASE_TIMESTAMP);
    });

    it('should return stream head timestamp from unread stream when it exists', async () => {
      const unreadPostIds = Array.from({ length: 2 }, (_, i) => `${DEFAULT_AUTHOR}:unread-${i + 1}`);
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);

      // Create unread stream (should take precedence)
      await Core.UnreadPostStreamModel.create(streamId, unreadPostIds);
      await createPostDetails(unreadPostIds);

      // Create post stream
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const result = await Core.PostStreamApplication.getStreamHead({ streamId });

      // Should return timestamp from unread stream head (first unread post)
      expect(result).toBe(BASE_TIMESTAMP);
    });

    it('should return FORCE_FETCH_NEW_POSTS when stream does not exist', async () => {
      const result = await Core.PostStreamApplication.getStreamHead({ streamId });

      expect(result).toBe(Core.FORCE_FETCH_NEW_POSTS);
    });

    it('should return SKIP_FETCH_NEW_POSTS when stream exists but head post has no details', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      // Don't create post details

      const result = await Core.PostStreamApplication.getStreamHead({ streamId });

      expect(result).toBe(Core.SKIP_FETCH_NEW_POSTS);
    });

    it('should handle errors from underlying service gracefully', async () => {
      const getStreamHeadSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'getStreamHead')
        .mockRejectedValue(new Error('Database error'));

      await expect(Core.PostStreamApplication.getStreamHead({ streamId })).rejects.toThrow('Database error');

      expect(getStreamHeadSpy).toHaveBeenCalledWith({ streamId });
    });

    it('should pass streamId parameter correctly to underlying service', async () => {
      const customStreamId = Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL as Core.PostStreamId;
      const expectedTimestamp = BASE_TIMESTAMP + 50;

      const getStreamHeadSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'getStreamHead')
        .mockResolvedValue(expectedTimestamp);

      const result = await Core.PostStreamApplication.getStreamHead({ streamId: customStreamId });

      expect(getStreamHeadSpy).toHaveBeenCalledWith({ streamId: customStreamId });
      expect(result).toBe(expectedTimestamp);
    });
  });

  describe('mergeUnreadStreamWithPostStream', () => {
    it('should merge unread stream with post stream when both exist', async () => {
      const unreadPostIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:unread-${i + 1}`);
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);

      // Create unread stream
      await Core.UnreadPostStreamModel.create(streamId, unreadPostIds);
      // Create post stream
      await createStreamWithPosts(postIds);

      await Core.PostStreamApplication.mergeUnreadStreamWithPostStream({ streamId });

      // Verify the streams were merged: unread posts first, then post stream
      const mergedStream = await Core.PostStreamModel.findById(streamId);
      expect(mergedStream).toBeTruthy();
      expect(mergedStream!.stream).toEqual([...unreadPostIds, ...postIds]);
    });

    it('should handle when unread stream does not exist (no-op)', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);

      // Should not throw and should not modify post stream
      await Core.PostStreamApplication.mergeUnreadStreamWithPostStream({ streamId });

      const postStream = await Core.PostStreamModel.findById(streamId);
      expect(postStream).toBeTruthy();
      expect(postStream!.stream).toEqual(postIds);
    });

    it('should handle when post stream does not exist (no-op)', async () => {
      const unreadPostIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:unread-${i + 1}`);
      await Core.UnreadPostStreamModel.create(streamId, unreadPostIds);

      // Should not throw and should not create post stream
      await Core.PostStreamApplication.mergeUnreadStreamWithPostStream({ streamId });

      const postStream = await Core.PostStreamModel.findById(streamId);
      expect(postStream).toBeNull();
    });

    it('should handle when both streams do not exist (no-op)', async () => {
      // Should not throw
      await Core.PostStreamApplication.mergeUnreadStreamWithPostStream({ streamId });

      const postStream = await Core.PostStreamModel.findById(streamId);
      expect(postStream).toBeNull();
    });

    it('should handle errors from underlying service', async () => {
      const mergeSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'mergeUnreadStreamWithPostStream')
        .mockRejectedValue(new Error('Database error'));

      await expect(Core.PostStreamApplication.mergeUnreadStreamWithPostStream({ streamId })).rejects.toThrow(
        'Database error',
      );

      expect(mergeSpy).toHaveBeenCalledWith({ streamId });
    });

    it('should pass streamId parameter correctly to underlying service', async () => {
      const customStreamId = Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL as Core.PostStreamId;

      const mergeSpy = vi.spyOn(Core.LocalStreamPostsService, 'mergeUnreadStreamWithPostStream').mockResolvedValue();

      await Core.PostStreamApplication.mergeUnreadStreamWithPostStream({ streamId: customStreamId });

      expect(mergeSpy).toHaveBeenCalledWith({ streamId: customStreamId });
    });
  });

  describe('getUnreadStream', () => {
    it('should return unread stream when it exists', async () => {
      const unreadPostIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:unread-${i + 1}`);
      await Core.UnreadPostStreamModel.create(streamId, unreadPostIds);

      const result = await Core.PostStreamApplication.getUnreadStream({ streamId });

      expect(result).toBeTruthy();
      expect(result!.stream).toEqual(unreadPostIds);
    });

    it('should return null when unread stream does not exist', async () => {
      const result = await Core.PostStreamApplication.getUnreadStream({ streamId });

      expect(result).toBeNull();
    });

    it('should handle errors from underlying service', async () => {
      const readUnreadStreamSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'readUnreadStream')
        .mockRejectedValue(new Error('Database error'));

      await expect(Core.PostStreamApplication.getUnreadStream({ streamId })).rejects.toThrow('Database error');

      expect(readUnreadStreamSpy).toHaveBeenCalledWith({ streamId });
    });

    it('should pass streamId parameter correctly to underlying service', async () => {
      const customStreamId = Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL as Core.PostStreamId;
      const mockUnreadStream = { stream: ['post-1', 'post-2'] };

      const readUnreadStreamSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'readUnreadStream')
        .mockResolvedValue(mockUnreadStream);

      const result = await Core.PostStreamApplication.getUnreadStream({ streamId: customStreamId });

      expect(readUnreadStreamSpy).toHaveBeenCalledWith({ streamId: customStreamId });
      expect(result).toEqual(mockUnreadStream);
    });
  });

  describe('getLocalStream', () => {
    it('should return local stream when it exists', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);

      const result = await Core.PostStreamApplication.getLocalStream({ streamId });

      expect(result).toBeTruthy();
      expect(result!.stream).toEqual(postIds);
    });

    it('should return null when stream does not exist', async () => {
      const result = await Core.PostStreamApplication.getLocalStream({ streamId });

      expect(result).toBeNull();
    });

    it('should handle errors from underlying service', async () => {
      const getLocalStreamSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'read')
        .mockRejectedValue(new Error('Database error'));

      await expect(Core.PostStreamApplication.getLocalStream({ streamId })).rejects.toThrow('Database error');

      expect(getLocalStreamSpy).toHaveBeenCalledWith({ streamId });
    });

    it('should pass streamId parameter correctly to underlying service', async () => {
      const customStreamId = Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL as Core.PostStreamId;
      const mockStream = { stream: ['post-1', 'post-2'] };

      const getLocalStreamSpy = vi.spyOn(Core.LocalStreamPostsService, 'read').mockResolvedValue(mockStream);

      const result = await Core.PostStreamApplication.getLocalStream({ streamId: customStreamId });

      expect(getLocalStreamSpy).toHaveBeenCalledWith({ streamId: customStreamId });
      expect(result).toEqual(mockStream);
    });
  });

  describe('clearUnreadStream', () => {
    it('should clear unread stream and return post IDs', async () => {
      const unreadPostIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:unread-${i + 1}`);
      await Core.UnreadPostStreamModel.create(streamId, unreadPostIds);

      const result = await Core.PostStreamApplication.clearUnreadStream({ streamId });

      expect(result).toEqual(unreadPostIds);
      const clearedStream = await Core.UnreadPostStreamModel.findById(streamId);
      expect(clearedStream).toBeNull();
    });

    it('should return empty array when unread stream does not exist', async () => {
      const result = await Core.PostStreamApplication.clearUnreadStream({ streamId });

      expect(result).toEqual([]);
    });

    it('should handle errors from underlying service', async () => {
      const clearUnreadStreamSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'clearUnreadStream')
        .mockRejectedValue(new Error('Database error'));

      await expect(Core.PostStreamApplication.clearUnreadStream({ streamId })).rejects.toThrow('Database error');

      expect(clearUnreadStreamSpy).toHaveBeenCalledWith({ streamId });
    });

    it('should pass streamId parameter correctly to underlying service', async () => {
      const customStreamId = Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL as Core.PostStreamId;
      const mockPostIds = ['post-1', 'post-2'];

      const clearUnreadStreamSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'clearUnreadStream')
        .mockResolvedValue(mockPostIds);

      const result = await Core.PostStreamApplication.clearUnreadStream({ streamId: customStreamId });

      expect(clearUnreadStreamSpy).toHaveBeenCalledWith({ streamId: customStreamId });
      expect(result).toEqual(mockPostIds);
    });
  });
});
