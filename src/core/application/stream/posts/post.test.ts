import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';

describe('PostStreamApplication', () => {
  const streamId = Core.PostStreamTypes.TIMELINE_ALL_ALL;
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

  beforeEach(async () => {
    // Clear all relevant tables
    await Core.PostStreamModel.table.clear();
    await Core.PostDetailsModel.table.clear();
    await Core.UserDetailsModel.table.clear();
    await Core.UserCountsModel.table.clear();
    await Core.UserRelationshipsModel.table.clear();
    await Core.UserTagsModel.table.clear();
    vi.clearAllMocks();
  });

  describe('getOrFetchStreamSlice', () => {
    it('should return posts from cache when available (no cursor)', async () => {
      // Create stream with posts
      const postIds = Array.from({ length: 20 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);

      // Read first 10 posts (no cursor = initial load)
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
      });

      expect(result.nextPageIds).toHaveLength(10);
      expect(result.nextPageIds).toEqual(postIds.slice(0, 10));
      expect(result.cacheMissPostIds).toEqual([]);
      expect(result.timestamp).toBeUndefined();
    });

    it('should fetch from Nexus when cache is empty', async () => {
      const mockNexusPosts = createMockNexusPosts(5);

      // Mock Nexus service
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      // Create empty stream first (required for persistNewStreamChunk)
      await createStreamWithPosts([]);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
      });

      // Should have fetched and cached posts
      expect(result.nextPageIds).toHaveLength(5);
      expect(result.nextPageIds).toEqual([
        `${DEFAULT_AUTHOR}:post-1`,
        `${DEFAULT_AUTHOR}:post-2`,
        `${DEFAULT_AUTHOR}:post-3`,
        `${DEFAULT_AUTHOR}:post-4`,
        `${DEFAULT_AUTHOR}:post-5`,
      ]);
      expect(result.timestamp).toBe(BASE_TIMESTAMP + 4);
      // All posts should be cache misses since they're not persisted yet
      expect(result.cacheMissPostIds).toHaveLength(5);
      expect(result.cacheMissPostIds).toEqual(result.nextPageIds);

      // Verify posts were cached
      const cached = await Core.PostStreamModel.findById(streamId);
      expect(cached?.stream).toEqual(result.nextPageIds);
    });

    it('should fetch from beginning when database is deleted (no cache with stale timestamp)', async () => {
      // Simulate scenario: User had posts, then deleted database
      // Timeline still has old timestamp in state, but no cache exists
      const mockNexusPosts = createMockNexusPosts(5);
      const staleTimestamp = BASE_TIMESTAMP + 100; // Old timestamp from before DB deletion

      // Mock Nexus service to track what parameters it receives
      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      // No cache exists (database was deleted) - stream doesn't exist at all
      // But we're passing a stale streamTail from previous session

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamTail: staleTimestamp, // Passing old timestamp
        lastPostId: undefined, // Initial load (no pagination cursor)
      });

      // Should detect no cache and force streamTail to 0 (fetch from beginning)
      // When streamTail=0, we don't set 'start' parameter - this fetches most recent posts
      expect(nexusFetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.not.objectContaining({
            start: expect.anything(), // start should NOT be set when streamTail=0
          }),
        }),
      );

      // Should have fetched and cached posts
      expect(result.nextPageIds).toHaveLength(5);
      expect(result.timestamp).toBe(BASE_TIMESTAMP + 4);

      // Verify stream was created with posts
      const cached = await Core.PostStreamModel.findById(streamId);
      expect(cached?.stream).toEqual(result.nextPageIds);
    });

    it('should paginate using cursor (post_id and timestamp)', async () => {
      // Create initial cache with 5 posts
      const initialPostIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(initialPostIds);
      await createPostDetails(initialPostIds);

      // Mock more posts from Nexus
      const mockNexusPosts = createMockNexusPosts(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      // Paginate from last post
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        post_id: `${DEFAULT_AUTHOR}:post-5`, // Last post in cache
        timestamp: BASE_TIMESTAMP + 4, // Timestamp of last post
      });

      // Should return newly fetched posts
      expect(result.nextPageIds).toHaveLength(5);
      expect(result.nextPageIds).toEqual([
        `${DEFAULT_AUTHOR}:post-6`,
        `${DEFAULT_AUTHOR}:post-7`,
        `${DEFAULT_AUTHOR}:post-8`,
        `${DEFAULT_AUTHOR}:post-9`,
        `${DEFAULT_AUTHOR}:post-10`,
      ]);
      expect(result.timestamp).toBe(BASE_TIMESTAMP + 9);

      // Verify cache was updated
      const cached = await Core.PostStreamModel.findById(streamId);
      expect(cached?.stream).toHaveLength(10);
    });

    it('should return empty array when no more posts available', async () => {
      // Create cache with posts
      const postIds = [`${DEFAULT_AUTHOR}:post-1`, `${DEFAULT_AUTHOR}:post-2`];
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      // Mock empty response from Nexus
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue([]);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        post_id: `${DEFAULT_AUTHOR}:post-2`,
        timestamp: BASE_TIMESTAMP + 1,
      });

      expect(result.nextPageIds).toHaveLength(0);
      expect(result.cacheMissPostIds).toEqual([]);
    });

    it('WIP: should fetch from Nexus when cache has insufficient posts', async () => {
      // Create cache with only 3 posts (less than limit of 10)
      const cachedPostIds = Array.from({ length: 3 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(cachedPostIds);

      // Mock more posts from Nexus
      const mockNexusPosts = createMockNexusPosts(5, 4, DEFAULT_AUTHOR, BASE_TIMESTAMP + 3);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      // Request 10 posts, but cache only has 3
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
      });

      // Should return all cached posts (3) since getStreamFromCache returns null when insufficient
      // and then fetch from Nexus
      expect(result.nextPageIds).toHaveLength(5);
      expect(result.nextPageIds).toEqual([
        `${DEFAULT_AUTHOR}:post-4`,
        `${DEFAULT_AUTHOR}:post-5`,
        `${DEFAULT_AUTHOR}:post-6`,
        `${DEFAULT_AUTHOR}:post-7`,
        `${DEFAULT_AUTHOR}:post-8`,
      ]);
    });

    it('should handle error when getting timestamp from post ID', async () => {
      // Create cache with posts
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);

      // Mock getTimestampFromPostId to throw an error
      vi.spyOn(Core.PostDetailsModel, 'findById').mockRejectedValue(new Error('Database error'));

      // Mock Nexus posts
      const mockNexusPosts = createMockNexusPosts(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      // Try to paginate with a post_id that will cause an error
      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        post_id: `${DEFAULT_AUTHOR}:post-5`,
        timestamp: BASE_TIMESTAMP + 4,
      });

      // Should still work, fetching from Nexus with undefined start timestamp
      expect(result.nextPageIds).toHaveLength(5);
    });
  });

  describe('fetchMissingPostsFromNexus', () => {
    const viewerId = 'user-viewer' as Core.Pubky;

    it('should fetch and persist posts when postBatch exists', async () => {
      const cacheMissPostIds = [`${DEFAULT_AUTHOR}:post-1`, `${DEFAULT_AUTHOR}:post-2`];
      const mockNexusPosts = createMockNexusPosts(2);

      // Mock queryNexus for posts
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusPosts);

      // Mock persistPosts
      const persistPostsSpy = vi
        .spyOn(Core.LocalStreamPostsService, 'persistPosts')
        .mockResolvedValue(cacheMissPostIds);

      // Mock getNotPersistedUsersInCache to return empty (all users already cached)
      vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder').mockResolvedValue([
        { id: DEFAULT_AUTHOR } as Core.UserDetailsModelSchema,
        { id: DEFAULT_AUTHOR } as Core.UserDetailsModelSchema,
      ]);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      // Verify queryNexus was called with correct parameters
      expect(queryNexusSpy).toHaveBeenCalledWith(
        expect.stringContaining('/stream/posts/by_ids'),
        'POST',
        expect.stringContaining(JSON.stringify({ post_ids: cacheMissPostIds, viewer_id: viewerId })),
      );
      expect(persistPostsSpy).toHaveBeenCalledWith(mockNexusPosts);
    });

    it('should handle when postBatch is null/undefined', async () => {
      const cacheMissPostIds = [`${DEFAULT_AUTHOR}:post-1`];

      // Mock queryNexus to return undefined
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(undefined);

      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(persistPostsSpy).not.toHaveBeenCalled();
    });

    it('should fetch and persist users when cacheMissUserIds exist', async () => {
      const cacheMissPostIds = [`${DEFAULT_AUTHOR}:post-1`];
      const mockNexusPosts = createMockNexusPosts(1);
      const mockNexusUsers = [createMockNexusUser(DEFAULT_AUTHOR)];

      // Mock queryNexus for posts and users
      const queryNexusSpy = vi
        .spyOn(Core, 'queryNexus')
        .mockResolvedValueOnce(mockNexusPosts) // First call for posts
        .mockResolvedValueOnce(mockNexusUsers); // Second call for users

      vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(['user-1:post-1']);

      // Mock getNotPersistedUsersInCache to return user-1 (not cached)
      vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder').mockResolvedValue([undefined]);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers').mockResolvedValue();

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      // Verify queryNexus was called twice (once for posts, once for users)
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
      const cacheMissPostIds = [`${DEFAULT_AUTHOR}:post-1`];
      const mockNexusPosts = createMockNexusPosts(1);

      // Mock queryNexus for posts, then undefined for users
      vi.spyOn(Core, 'queryNexus')
        .mockResolvedValueOnce(mockNexusPosts) // First call for posts
        .mockResolvedValueOnce(undefined); // Second call for users returns undefined

      vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(cacheMissPostIds);

      // Mock getNotPersistedUsersInCache to return user-1 (not cached)
      vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder').mockResolvedValue([undefined]);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(persistUsersSpy).not.toHaveBeenCalled();
    });

    it('should not fetch users when all users are already cached', async () => {
      const cacheMissPostIds = [`${DEFAULT_AUTHOR}:post-1`];
      const mockNexusPosts = createMockNexusPosts(1);

      vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.LocalStreamPostsService, 'persistPosts').mockResolvedValue(cacheMissPostIds);

      // Mock getNotPersistedUsersInCache to return empty array (all users cached)
      vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder').mockResolvedValue([
        { id: DEFAULT_AUTHOR } as Core.UserDetailsModelSchema,
      ]);

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      // Should only call queryNexus once (for posts), not for users when all users are cached
      expect(queryNexusSpy).toHaveBeenCalledTimes(1);
    });
  });
});
