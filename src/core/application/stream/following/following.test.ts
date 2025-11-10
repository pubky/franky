import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';

describe('FollowingStreamApplication', () => {
  const streamId = Core.UserStreamTypes.TODAY_FOLLOWING_ALL;
  const DEFAULT_USER = 'user-1' as Core.Pubky;
  const BASE_TIMESTAMP = 1000000;

  // ============================================================================
  // Test Helpers
  // ============================================================================

  const createMockNexusUser = (
    userId: Core.Pubky = DEFAULT_USER,
    overrides?: Partial<Core.NexusUser>,
  ): Core.NexusUser => ({
    details: {
      id: userId,
      name: `User ${userId}`,
      bio: 'Bio content',
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

  const createMockNexusUsers = (count: number, startIndex: number = 1): Core.NexusUser[] => {
    return Array.from({ length: count }, (_, i) => {
      const userId = `user-${startIndex + i}` as Core.Pubky;
      return createMockNexusUser(userId);
    });
  };

  const createUserDetails = async (userIds: Core.Pubky[]) => {
    return Promise.all(
      userIds.map((userId) =>
        Core.UserDetailsModel.create({
          id: userId,
          name: `User ${userId}`,
          bio: 'Bio content',
          links: null,
          status: null,
          image: null,
          indexed_at: BASE_TIMESTAMP,
        }),
      ),
    );
  };

  const createStreamWithUsers = async (userIds: Core.Pubky[]) => {
    await Core.UserStreamModel.create(streamId, userIds);
  };

  beforeEach(async () => {
    // Clear all relevant tables
    await Core.UserStreamModel.table.clear();
    await Core.UserDetailsModel.table.clear();
    await Core.UserCountsModel.table.clear();
    await Core.UserRelationshipsModel.table.clear();
    await Core.UserTagsModel.table.clear();
    vi.clearAllMocks();
  });

  describe('getOrFetchStreamSlice', () => {
    it('should return users from cache when available (no skip)', async () => {
      // Create stream with users
      const userIds: Core.Pubky[] = Array.from({ length: 20 }, (_, i) => `user-${i + 1}` as Core.Pubky);
      await createStreamWithUsers(userIds);

      // Read first 10 users (no skip = initial load)
      const result = await Core.FollowingStreamApplication.getOrFetchStreamSlice({
        streamId,
        user_id: DEFAULT_USER,
        limit: 10,
      });

      expect(result.nextPageIds).toHaveLength(10);
      expect(result.nextPageIds).toEqual(userIds.slice(0, 10));
      expect(result.cacheMissUserIds).toEqual([]);
      expect(result.skip).toBeUndefined();
    });

    it('should fetch from Nexus when cache is empty', async () => {
      const mockNexusUsers = createMockNexusUsers(5);

      // Mock Nexus service
      vi.spyOn(Core.NexusFollowingStreamService, 'fetch').mockResolvedValue(mockNexusUsers);

      const result = await Core.FollowingStreamApplication.getOrFetchStreamSlice({
        streamId,
        user_id: DEFAULT_USER,
        limit: 10,
      });

      // Should have fetched and cached users
      expect(result.nextPageIds).toHaveLength(5);
      expect(result.nextPageIds).toEqual(['user-1', 'user-2', 'user-3', 'user-4', 'user-5']);
      expect(result.skip).toBe(5);
      // Users are persisted immediately when fetched from Nexus, so no cache misses
      expect(result.cacheMissUserIds).toHaveLength(0);

      // Verify users were cached
      const cached = await Core.UserStreamModel.findById(streamId);
      expect(cached?.stream).toEqual(result.nextPageIds);
    });

    it('should paginate using skip', async () => {
      // Create initial cache with 5 users
      const initialUserIds: Core.Pubky[] = Array.from({ length: 5 }, (_, i) => `user-${i + 1}` as Core.Pubky);
      await createStreamWithUsers(initialUserIds);
      await createUserDetails(initialUserIds);

      // Mock more users from Nexus
      const mockNexusUsers = createMockNexusUsers(5, 6);
      vi.spyOn(Core.NexusFollowingStreamService, 'fetch').mockResolvedValue(mockNexusUsers);

      // Paginate from skip 5
      const result = await Core.FollowingStreamApplication.getOrFetchStreamSlice({
        streamId,
        user_id: DEFAULT_USER,
        limit: 10,
        skip: 5,
      });

      // Should return newly fetched users
      expect(result.nextPageIds).toHaveLength(5);
      expect(result.nextPageIds).toEqual(['user-6', 'user-7', 'user-8', 'user-9', 'user-10']);
      expect(result.skip).toBe(10);

      // Verify cache was updated
      const cached = await Core.UserStreamModel.findById(streamId);
      expect(cached?.stream).toHaveLength(10);
    });

    it('should return empty array when no more users available', async () => {
      // Create cache with users
      const userIds: Core.Pubky[] = ['user-1' as Core.Pubky, 'user-2' as Core.Pubky];
      await createStreamWithUsers(userIds);
      await createUserDetails(userIds);

      // Mock empty response from Nexus
      vi.spyOn(Core.NexusFollowingStreamService, 'fetch').mockResolvedValue([]);

      const result = await Core.FollowingStreamApplication.getOrFetchStreamSlice({
        streamId,
        user_id: DEFAULT_USER,
        limit: 10,
        skip: 2,
      });

      expect(result.nextPageIds).toHaveLength(0);
      expect(result.cacheMissUserIds).toEqual([]);
    });

    it('should fetch from Nexus when cache has insufficient users', async () => {
      // Create cache with only 3 users (less than limit of 10)
      const cachedUserIds: Core.Pubky[] = Array.from({ length: 3 }, (_, i) => `user-${i + 1}` as Core.Pubky);
      await createStreamWithUsers(cachedUserIds);

      // Mock more users from Nexus
      const mockNexusUsers = createMockNexusUsers(5, 4);
      vi.spyOn(Core.NexusFollowingStreamService, 'fetch').mockResolvedValue(mockNexusUsers);

      // Request 10 users, but cache only has 3
      const result = await Core.FollowingStreamApplication.getOrFetchStreamSlice({
        streamId,
        user_id: DEFAULT_USER,
        limit: 10,
      });

      // Should fetch from Nexus since cache has insufficient data
      expect(result.nextPageIds).toHaveLength(5);
      expect(result.nextPageIds).toEqual(['user-4', 'user-5', 'user-6', 'user-7', 'user-8']);
    });
  });

  describe('fetchMissingUsersFromNexus', () => {
    const viewerId = 'user-viewer' as Core.Pubky;

    it('should fetch and persist users when userBatch exists', async () => {
      const cacheMissUserIds: Core.Pubky[] = ['user-1' as Core.Pubky, 'user-2' as Core.Pubky];
      const mockNexusUsers = createMockNexusUsers(2);

      // Mock queryNexus for users
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockNexusUsers);

      // Mock persistUsers
      const persistUsersSpy = vi
        .spyOn(Core.LocalStreamFollowingService, 'persistUsers')
        .mockResolvedValue(cacheMissUserIds);

      await Core.FollowingStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId,
      });

      // Verify queryNexus was called with correct parameters
      expect(queryNexusSpy).toHaveBeenCalledWith(
        expect.stringContaining('/stream/users/by_ids'),
        'POST',
        expect.stringContaining(JSON.stringify({ user_ids: cacheMissUserIds, viewer_id: viewerId })),
      );
      expect(persistUsersSpy).toHaveBeenCalledWith(mockNexusUsers);
    });

    it('should handle when userBatch is null/undefined', async () => {
      const cacheMissUserIds: Core.Pubky[] = ['user-1' as Core.Pubky];

      // Mock queryNexus to return undefined
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(undefined);

      const persistUsersSpy = vi.spyOn(Core.LocalStreamFollowingService, 'persistUsers');

      await Core.FollowingStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId,
      });

      expect(persistUsersSpy).not.toHaveBeenCalled();
    });

    it('should not fetch users when cacheMissUserIds is empty', async () => {
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus');

      await Core.FollowingStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds: [],
        viewerId: 'viewer' as Core.Pubky,
      });

      expect(queryNexusSpy).not.toHaveBeenCalled();
    });
  });
});
