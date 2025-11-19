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
    persistFilesFromUris: vi.spyOn(Core, 'persistFilesFromUris').mockResolvedValue(),
    getUserDetails: vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder'),
  });

  const mockAllUsersCached = (count = 1, author = DEFAULT_AUTHOR) => {
    return Array.from({ length: count }, () => ({ id: author }) as Core.UserDetailsModelSchema);
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    await Core.PostStreamModel.table.clear();
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
        streamTail: 0,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(result.nextPageIds).toHaveLength(10);
      expect(result.nextPageIds).toEqual(postIds.slice(0, 10));
      expect(result.cacheMissPostIds).toEqual([]);
      expect(result.timestamp).toBeUndefined();
    });

    it('should fetch from Nexus when cache is empty', async () => {
      const mockNexusPosts = createMockNexusPosts(5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);
      await createStreamWithPosts([]);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
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

    it('should fetch from beginning when database is deleted (no cache with stale timestamp)', async () => {
      const mockNexusPosts = createMockNexusPosts(5);
      const staleTimestamp = BASE_TIMESTAMP + 100;
      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamTail: staleTimestamp,
        lastPostId: undefined,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(nexusFetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.not.objectContaining({
            start: expect.anything(),
          }),
        }),
      );

      expect(result.nextPageIds).toHaveLength(5);
      expect(result.timestamp).toBe(BASE_TIMESTAMP + 4);

      const cached = await Core.PostStreamModel.findById(streamId);
      expect(cached?.stream).toEqual(result.nextPageIds);
    });

    it('should paginate using cursor (post_id and timestamp)', async () => {
      const initialPostIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(initialPostIds);
      await createPostDetails(initialPostIds);

      const mockNexusPosts = createMockNexusPosts(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
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
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue([]);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        lastPostId: `${DEFAULT_AUTHOR}:post-2`,
        streamTail: BASE_TIMESTAMP + 1,
        viewerId: 'user-viewer' as Core.Pubky,
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
        streamTail: 0,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(result.nextPageIds).toHaveLength(5);
      expectPostIds(result.nextPageIds, 4, 5);
    });

    it('should handle error when getting timestamp from post ID', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);

      vi.spyOn(Core.PostDetailsModel, 'findById').mockRejectedValue(new Error('Database error'));
      const mockNexusPosts = createMockNexusPosts(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        lastPostId: `${DEFAULT_AUTHOR}:post-5`,
        streamTail: BASE_TIMESTAMP + 4,
        viewerId: 'user-viewer' as Core.Pubky,
      });

      expect(result.nextPageIds).toHaveLength(5);
    });

    it('should handle when post_id is provided but post is not in cache', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);

      const mockNexusPosts = createMockNexusPosts(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        lastPostId: `${DEFAULT_AUTHOR}:post-999`,
        streamTail: BASE_TIMESTAMP + 999,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(5);
    });

    it('should handle when cache has exactly limit number of posts', async () => {
      const postIds = Array.from({ length: 10 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamTail: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(10);
      expect(result.nextPageIds).toEqual(postIds);
      expect(result.cacheMissPostIds).toEqual([]);
    });

    it('should handle when cache has posts but not enough after post_id', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const mockNexusPosts = createMockNexusPosts(5, 6, DEFAULT_AUTHOR, BASE_TIMESTAMP + 5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        lastPostId: `${DEFAULT_AUTHOR}:post-3`,
        streamTail: BASE_TIMESTAMP + 2,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(5);
      expectPostIds(result.nextPageIds, 6, 5);
    });

    it('should propagate error when NexusPostStreamService.fetch fails', async () => {
      await createStreamWithPosts([]);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(
        Core.PostStreamApplication.getOrFetchStreamSlice({
          streamId,
          limit: 10,
          streamTail: 0,
          viewerId: DEFAULT_AUTHOR,
        }),
      ).rejects.toThrow('Network error');
    });

    it('should propagate error when persistNewStreamChunk fails (stream write operation)', async () => {
      await createStreamWithPosts([]);
      const mockNexusPosts = createMockNexusPosts(5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.LocalStreamPostsService, 'persistNewStreamChunk').mockRejectedValue(
        new Error('Failed to persist stream chunk'),
      );

      await expect(
        Core.PostStreamApplication.getOrFetchStreamSlice({
          streamId,
          limit: 10,
          streamTail: 0,
          viewerId: DEFAULT_AUTHOR,
        }),
      ).rejects.toThrow('Failed to persist stream chunk');
    });

    it('should propagate error when getNotPersistedPostsInCache fails (post details read operation)', async () => {
      await createStreamWithPosts([]);
      const mockNexusPosts = createMockNexusPosts(5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.LocalStreamPostsService, 'persistNewStreamChunk').mockResolvedValue(undefined);

      const findByIdsSpy = vi
        .spyOn(Core.PostDetailsModel, 'findByIdsPreserveOrder')
        .mockRejectedValue(new Error('Database query failed'));

      await expect(
        Core.PostStreamApplication.getOrFetchStreamSlice({
          streamId,
          limit: 10,
          streamTail: 0,
          viewerId: DEFAULT_AUTHOR,
        }),
      ).rejects.toThrow('Database query failed');

      findByIdsSpy.mockRestore();
    });

    it('should handle posts with different authors', async () => {
      await createStreamWithPosts([]);
      const mockNexusPosts: Core.NexusPost[] = [
        createMockNexusPost('post-1', 'author-1', BASE_TIMESTAMP),
        createMockNexusPost('post-2', 'author-2', BASE_TIMESTAMP + 1),
        createMockNexusPost('post-3', 'author-1', BASE_TIMESTAMP + 2),
      ];
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.PostDetailsModel, 'findByIdsPreserveOrder').mockResolvedValue(Array(3).fill(undefined));

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamTail: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(3);
      expect(result.nextPageIds).toEqual(['author-1:post-1', 'author-2:post-2', 'author-1:post-3']);
    });

    it('should handle when limit is 0', async () => {
      const postIds = Array.from({ length: 5 }, (_, i) => `${DEFAULT_AUTHOR}:post-${i + 1}`);
      await createStreamWithPosts(postIds);
      await createPostDetails(postIds);

      const nexusFetchSpy = vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue([]);

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 0,
        streamTail: 0,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(0);
      expect(result.cacheMissPostIds).toEqual([]);
      expect(result.timestamp).toBeUndefined();
      expect(nexusFetchSpy).not.toHaveBeenCalled();
    });

    it('should handle when timestamp is provided but post_id is not', async () => {
      await createStreamWithPosts([]);
      const mockNexusPosts = createMockNexusPosts(5);
      vi.spyOn(Core.NexusPostStreamService, 'fetch').mockResolvedValue(mockNexusPosts);
      vi.spyOn(Core.PostDetailsModel, 'findByIdsPreserveOrder').mockResolvedValue(Array(5).fill(undefined));

      const result = await Core.PostStreamApplication.getOrFetchStreamSlice({
        streamId,
        limit: 10,
        streamTail: BASE_TIMESTAMP,
        viewerId: DEFAULT_AUTHOR,
      });

      expect(result.nextPageIds).toHaveLength(5);
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
      expect(mocks.persistPosts).toHaveBeenCalledWith(mockNexusPosts);
      expect(mocks.persistFilesFromUris).toHaveBeenCalledWith([]);
    });

    it('should handle when postBatch is null/undefined', async () => {
      const { cacheMissPostIds } = createTestData(1);
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(undefined);
      const persistPostsSpy = vi.spyOn(Core.LocalStreamPostsService, 'persistPosts');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(persistPostsSpy).not.toHaveBeenCalled();
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

      vi.spyOn(Core, 'queryNexus').mockResolvedValueOnce(mockNexusPosts).mockResolvedValueOnce(undefined);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(persistUsersSpy).not.toHaveBeenCalled();
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
      expect(mocks.persistPosts).toHaveBeenCalledWith([]);
    });

    it('should handle when postBatch is empty array', async () => {
      const { cacheMissPostIds } = createTestData(1);
      const mocks = setupDefaultMocks();

      vi.spyOn(Core, 'queryNexus').mockResolvedValue([]);

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(mocks.persistPosts).toHaveBeenCalledWith([]);
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
      const persistFilesFromUrisSpy = vi
        .spyOn(Core, 'persistFilesFromUris')
        .mockRejectedValue(new Error('Failed to persist files'));

      const getUserDetailsSpy = vi.spyOn(Core.UserDetailsModel, 'findByIdsPreserveOrder');
      const persistUsersSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');

      await Core.PostStreamApplication.fetchMissingPostsFromNexus({
        cacheMissPostIds,
        viewerId,
      });

      expect(persistFilesFromUrisSpy).toHaveBeenCalledWith(mockAttachments);
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
});
