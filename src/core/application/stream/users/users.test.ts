import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';

describe('UserStreamApplication', () => {
  const DEFAULT_USER_ID = 'user-1' as Core.Pubky;
  const DEFAULT_VIEWER_ID = 'viewer-123' as Core.Pubky;
  const BASE_TIMESTAMP = 1000000;

  // ============================================================================
  // Test Helpers
  // ============================================================================

  const createMockNexusUser = (
    userId: Core.Pubky = DEFAULT_USER_ID,
    overrides?: Partial<Core.NexusUser>,
  ): Core.NexusUser => ({
    details: {
      id: userId,
      name: `User ${userId}`,
      bio: `Bio for ${userId}`,
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
      posts: 10,
      replies: 5,
      following: 20,
      followers: 30,
      friends: 15,
      bookmarks: 8,
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

  const createMockNexusUsers = (count: number, startIndex: number = 1, prefix: string = 'user'): Core.NexusUser[] => {
    return Array.from({ length: count }, (_, i) => {
      const userId = `${prefix}-${startIndex + i}` as Core.Pubky;
      return createMockNexusUser(userId);
    });
  };

  const createUserDetails = async (userIds: Core.Pubky[]) => {
    return Promise.all(
      userIds.map((userId) =>
        Core.UserDetailsModel.create({
          id: userId,
          name: `User ${userId}`,
          bio: `Bio for ${userId}`,
          links: null,
          status: null,
          image: null,
          indexed_at: BASE_TIMESTAMP,
        }),
      ),
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // getOrFetchStreamSlice Tests
  // ============================================================================

  describe('getOrFetchStreamSlice', () => {
    it('should return users from cache when available', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const cachedUserIds: Core.Pubky[] = ['follower-1', 'follower-2', 'follower-3'];

      // Setup: Create cache
      await Core.LocalStreamUsersService.upsert({ streamId, stream: cachedUserIds });
      await createUserDetails(cachedUserIds);

      // Test
      const result = await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 0,
        limit: 2,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert
      expect(result.nextPageIds).toEqual(['follower-1', 'follower-2']);
      expect(result.cacheMissUserIds).toEqual([]);
      expect(result.skip).toBeUndefined(); // Cache hit returns undefined skip
    });

    it('should fetch from Nexus when cache is empty', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const mockUsers = createMockNexusUsers(3, 1, 'follower');

      // Mock Nexus API
      const fetchSpy = vi.spyOn(Core.NexusUserStreamService, 'fetch').mockResolvedValue(mockUsers);

      // Test
      const result = await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 0,
        limit: 3,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert
      expect(fetchSpy).toHaveBeenCalledWith({
        streamId,
        params: { skip: 0, limit: 3, viewer_id: DEFAULT_VIEWER_ID },
      });
      expect(result.nextPageIds).toEqual(['follower-1', 'follower-2', 'follower-3']);
      expect(result.skip).toBe(3); // Nexus returns next skip value

      // Verify cache was updated
      const cachedStream = await Core.LocalStreamUsersService.findById(streamId);
      expect(cachedStream?.stream).toEqual(['follower-1', 'follower-2', 'follower-3']);
    });

    it('should handle pagination with skip/limit', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const cachedUserIds: Core.Pubky[] = ['follower-1', 'follower-2', 'follower-3', 'follower-4', 'follower-5'];

      // Setup: Create cache
      await Core.LocalStreamUsersService.upsert({ streamId, stream: cachedUserIds });
      await createUserDetails(cachedUserIds);

      // Test: Get second page
      const result = await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 2,
        limit: 2,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert
      expect(result.nextPageIds).toEqual(['follower-3', 'follower-4']);
      expect(result.skip).toBeUndefined();
    });

    it('should return empty array when no more users available', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const mockUsers: Core.NexusUser[] = [];

      // Mock Nexus API to return empty
      const fetchSpy = vi.spyOn(Core.NexusUserStreamService, 'fetch').mockResolvedValue(mockUsers);

      // Test
      const result = await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 0,
        limit: 20,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert
      expect(fetchSpy).toHaveBeenCalled();
      expect(result.nextPageIds).toEqual([]);
      expect(result.cacheMissUserIds).toEqual([]);
      expect(result.skip).toBeUndefined();
    });

    it('should fetch from Nexus when cache has insufficient data', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const cachedUserIds: Core.Pubky[] = ['follower-1', 'follower-2'];
      const newMockUsers = createMockNexusUsers(3, 3, 'follower');

      // Setup: Create partial cache
      await Core.LocalStreamUsersService.upsert({ streamId, stream: cachedUserIds });
      await createUserDetails(cachedUserIds);

      // Mock Nexus API
      const fetchSpy = vi.spyOn(Core.NexusUserStreamService, 'fetch').mockResolvedValue(newMockUsers);

      // Test: Request more than cache has
      const result = await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 2,
        limit: 3,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert: Should fetch from Nexus
      expect(fetchSpy).toHaveBeenCalledWith({
        streamId,
        params: { skip: 2, limit: 3, viewer_id: DEFAULT_VIEWER_ID },
      });
      expect(result.nextPageIds).toEqual(['follower-3', 'follower-4', 'follower-5']);

      // Verify cache was appended (not replaced)
      const cachedStream = await Core.LocalStreamUsersService.findById(streamId);
      expect(cachedStream?.stream).toEqual(['follower-1', 'follower-2', 'follower-3', 'follower-4', 'follower-5']);
    });

    it('should handle cachedStream parameter correctly when appending', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const existingUserIds: Core.Pubky[] = ['follower-1', 'follower-2'];
      const newMockUsers = createMockNexusUsers(2, 3, 'follower');

      // Setup: Create existing cache
      await Core.LocalStreamUsersService.upsert({ streamId, stream: existingUserIds });

      // Mock Nexus API
      vi.spyOn(Core.NexusUserStreamService, 'fetch').mockResolvedValue(newMockUsers);

      // Test
      await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 2,
        limit: 2,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert: Stream should be appended, not replaced
      const cachedStream = await Core.LocalStreamUsersService.findById(streamId);
      expect(cachedStream?.stream).toEqual(['follower-1', 'follower-2', 'follower-3', 'follower-4']);
    });

    it('should create new stream when cachedStream is null', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const mockUsers = createMockNexusUsers(3, 1, 'follower');

      // Mock Nexus API
      vi.spyOn(Core.NexusUserStreamService, 'fetch').mockResolvedValue(mockUsers);

      // Test
      await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 0,
        limit: 3,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert: New stream should be created
      const cachedStream = await Core.LocalStreamUsersService.findById(streamId);
      expect(cachedStream?.stream).toEqual(['follower-1', 'follower-2', 'follower-3']);
    });

    it('should return cacheMissUserIds correctly', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const mockUsers = createMockNexusUsers(3, 1, 'follower');

      // Mock Nexus API
      vi.spyOn(Core.NexusUserStreamService, 'fetch').mockResolvedValue(mockUsers);

      // Note: LocalStreamUsersService.persistUsers will save to UserDetailsModel
      // But getNotPersistedUsersInCache checks what's in cache before persist completes
      // So cacheMissUserIds should be empty after persistUsers runs

      // Test
      const result = await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 0,
        limit: 3,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // After persistUsers, all users should be in cache
      expect(result.cacheMissUserIds).toEqual([]);
    });

    it('should handle enum-based stream IDs (influencers)', async () => {
      const streamId = Core.UserStreamTypes.TODAY_INFLUENCERS_ALL;
      const mockUsers = createMockNexusUsers(3, 1, 'influencer');

      // Mock Nexus API
      const fetchSpy = vi.spyOn(Core.NexusUserStreamService, 'fetch').mockResolvedValue(mockUsers);

      // Test
      const result = await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 0,
        limit: 3,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert
      expect(fetchSpy).toHaveBeenCalledWith({
        streamId,
        params: { skip: 0, limit: 3, viewer_id: DEFAULT_VIEWER_ID },
      });
      expect(result.nextPageIds).toEqual(['influencer-1', 'influencer-2', 'influencer-3']);
    });

    it('should pass viewerId to Nexus API for relationship data', async () => {
      const streamId = Core.buildUserCompositeId({ userId: DEFAULT_USER_ID, reach: 'followers' });
      const mockUsers = createMockNexusUsers(2, 1, 'follower');

      // Mock Nexus API
      const fetchSpy = vi.spyOn(Core.NexusUserStreamService, 'fetch').mockResolvedValue(mockUsers);

      // Test
      await Core.UserStreamApplication.getOrFetchStreamSlice({
        streamId,
        skip: 0,
        limit: 2,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert: viewerId should be passed through
      expect(fetchSpy).toHaveBeenCalledWith({
        streamId,
        params: { skip: 0, limit: 2, viewer_id: DEFAULT_VIEWER_ID },
      });
    });
  });

  // ============================================================================
  // fetchMissingUsersFromNexus Tests
  // ============================================================================

  describe('fetchMissingUsersFromNexus', () => {
    it('should fetch and persist users when cacheMissUserIds exist', async () => {
      const cacheMissUserIds: Core.Pubky[] = ['user-1', 'user-2', 'user-3'];
      const mockUsers = cacheMissUserIds.map((id) => createMockNexusUser(id));

      // Mock queryNexus
      const querySpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockUsers);

      // Mock persistUsers to track it was called
      const persistSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');

      // Test
      await Core.UserStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert
      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('/v0/stream/users/by_ids'),
        'POST',
        expect.any(String),
      );
      expect(persistSpy).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle when userBatch is null/undefined', async () => {
      const cacheMissUserIds: Core.Pubky[] = ['user-1', 'user-2'];

      // Mock queryNexus to return null
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      // Mock persistUsers to ensure it's NOT called
      const persistSpy = vi.spyOn(Core.LocalStreamUsersService, 'persistUsers');

      // Test
      await Core.UserStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert: persistUsers should NOT be called when userBatch is null
      expect(persistSpy).not.toHaveBeenCalled();
    });

    it('should not fetch when cacheMissUserIds is empty', async () => {
      // Mock queryNexus to track it's not called
      const querySpy = vi.spyOn(Core, 'queryNexus');

      // Test
      await Core.UserStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds: [],
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert
      expect(querySpy).not.toHaveBeenCalled();
    });

    it('should pass viewerId to usersByIds API', async () => {
      const cacheMissUserIds: Core.Pubky[] = ['user-1', 'user-2'];
      const mockUsers = cacheMissUserIds.map((id) => createMockNexusUser(id));

      // Mock queryNexus
      const querySpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockUsers);

      // Test
      await Core.UserStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId: DEFAULT_VIEWER_ID,
      });

      // Assert: Check the body contains viewer_id
      const callArgs = querySpy.mock.calls[0];
      const bodyStr = callArgs[2] as string;
      const body = JSON.parse(bodyStr);
      expect(body.viewer_id).toBe(DEFAULT_VIEWER_ID);
    });

    it('should handle missing viewerId', async () => {
      const cacheMissUserIds: Core.Pubky[] = ['user-1'];
      const mockUsers = [createMockNexusUser('user-1')];

      // Mock queryNexus
      const querySpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockUsers);

      // Test without viewerId
      await Core.UserStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId: undefined,
      });

      // Assert: Should still work, just without viewer_id
      expect(querySpy).toHaveBeenCalled();
    });
  });
});
