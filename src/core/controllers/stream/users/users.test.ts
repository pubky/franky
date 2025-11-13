import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Config from '@/config';
import { StreamUserController } from './users';

describe('StreamUserController', () => {
  const targetUserId = 'user-target' as Core.Pubky;
  const viewerId = 'user-viewer' as Core.Pubky;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useAuthStore
    vi.spyOn(Core.useAuthStore.getState(), 'selectCurrentUserPubky').mockReturnValue(viewerId);
  });

  describe('getOrFetchStreamSlice', () => {
    it('should return users when no cache misses', async () => {
      const streamId = Core.buildUserCompositeId({ userId: targetUserId, reach: 'followers' });
      const nextPageIds: Core.Pubky[] = ['follower-1', 'follower-2', 'follower-3'];

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissUserIds: [],
        skip: undefined,
      });

      const fetchMissingUsersSpy = vi.spyOn(Core.UserStreamApplication, 'fetchMissingUsersFromNexus');

      const result = await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        skip: 0,
        limit: Config.NEXUS_USERS_PER_PAGE,
        viewerId,
      });
      expect(fetchMissingUsersSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        nextPageIds,
        skip: undefined,
      });
    });

    it('should fetch missing users when cacheMissUserIds exist', async () => {
      const streamId = Core.buildUserCompositeId({ userId: targetUserId, reach: 'followers' });
      const nextPageIds: Core.Pubky[] = ['follower-1', 'follower-2'];
      const cacheMissUserIds: Core.Pubky[] = ['follower-3', 'follower-4'];

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissUserIds,
        skip: 20,
      });

      const fetchMissingUsersSpy = vi
        .spyOn(Core.UserStreamApplication, 'fetchMissingUsersFromNexus')
        .mockResolvedValue();

      const result = await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        skip: 0,
        limit: Config.NEXUS_USERS_PER_PAGE,
        viewerId,
      });
      expect(Core.useAuthStore.getState().selectCurrentUserPubky).toHaveBeenCalled();
      expect(fetchMissingUsersSpy).toHaveBeenCalledWith({
        cacheMissUserIds,
        viewerId,
      });
      expect(result).toEqual({
        nextPageIds,
        skip: 20,
      });
    });

    it('should pass streamId and skip correctly to application layer', async () => {
      const streamId = Core.buildUserCompositeId({ userId: targetUserId, reach: 'following' });
      const skip = 20;

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: [],
        cacheMissUserIds: [],
        skip: undefined,
      });

      await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        skip,
        limit: Config.NEXUS_USERS_PER_PAGE,
        viewerId,
      });
    });

    it('should extract viewerId from auth store correctly', async () => {
      const streamId = Core.buildUserCompositeId({ userId: targetUserId, reach: 'followers' });
      const customViewerId = 'custom-viewer' as Core.Pubky;

      // Update mock to return custom viewer
      vi.spyOn(Core.useAuthStore.getState(), 'selectCurrentUserPubky').mockReturnValue(customViewerId);

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: [],
        cacheMissUserIds: [],
        skip: undefined,
      });

      await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        skip: 0,
        limit: Config.NEXUS_USERS_PER_PAGE,
        viewerId: customViewerId,
      });
    });

    it('should use Config.NEXUS_USERS_PER_PAGE as limit', async () => {
      const streamId = Core.buildUserCompositeId({ userId: targetUserId, reach: 'followers' });

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: [],
        cacheMissUserIds: [],
        skip: undefined,
      });

      await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        skip: 0,
        limit: Config.NEXUS_USERS_PER_PAGE,
        viewerId,
      });
    });

    it('should not fetch missing users when cacheMissUserIds is empty array', async () => {
      const streamId = Core.buildUserCompositeId({ userId: targetUserId, reach: 'followers' });

      vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: ['follower-1'],
        cacheMissUserIds: [],
        skip: 20,
      });

      const fetchMissingUsersSpy = vi.spyOn(Core.UserStreamApplication, 'fetchMissingUsersFromNexus');

      await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip: 0,
      });

      expect(fetchMissingUsersSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined skip in response', async () => {
      const streamId = Core.buildUserCompositeId({ userId: targetUserId, reach: 'followers' });

      vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: ['follower-1', 'follower-2'],
        cacheMissUserIds: [],
        skip: undefined,
      });

      const result = await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip: 0,
      });

      expect(result.skip).toBeUndefined();
    });

    it('should handle enum-based stream IDs (influencers)', async () => {
      const streamId = Core.UserStreamTypes.TODAY_INFLUENCERS_ALL;

      const getOrFetchStreamSliceSpy = vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: ['influencer-1', 'influencer-2'],
        cacheMissUserIds: [],
        skip: undefined,
      });

      await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip: 0,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        skip: 0,
        limit: Config.NEXUS_USERS_PER_PAGE,
        viewerId,
      });
    });

    it('should handle background fetch as non-blocking', async () => {
      const streamId = Core.buildUserCompositeId({ userId: targetUserId, reach: 'followers' });
      const nextPageIds: Core.Pubky[] = ['follower-1', 'follower-2'];
      const cacheMissUserIds: Core.Pubky[] = ['follower-3'];

      vi.spyOn(Core.UserStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissUserIds,
        skip: 20,
      });

      // Make fetchMissingUsersFromNexus slow to verify non-blocking
      const fetchMissingUsersSpy = vi
        .spyOn(Core.UserStreamApplication, 'fetchMissingUsersFromNexus')
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const result = await StreamUserController.getOrFetchStreamSlice({
        streamId,
        skip: 0,
      });

      // Result should be returned immediately (background fetch runs after await)
      expect(result).toEqual({
        nextPageIds,
        skip: 20,
      });

      // But fetchMissingUsersFromNexus should still be called
      expect(fetchMissingUsersSpy).toHaveBeenCalled();
    });
  });
});
