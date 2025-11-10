import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Config from '@/config';
import { StreamFollowingController } from './following';

describe('StreamFollowingController', () => {
  const streamId = Core.UserStreamTypes.TODAY_FOLLOWING_ALL;
  const viewerId = 'user-viewer' as Core.Pubky;
  const userId = 'user-1' as Core.Pubky;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useAuthStore
    vi.spyOn(Core.useAuthStore.getState(), 'selectCurrentUserPubky').mockReturnValue(viewerId);
  });

  describe('getOrFetchStreamSlice', () => {
    it('should return users when no cache misses', async () => {
      const nextPageIds: Core.Pubky[] = ['user-1' as Core.Pubky, 'user-2' as Core.Pubky];
      const skip = 10;

      const getOrFetchStreamSliceSpy = vi
        .spyOn(Core.FollowingStreamApplication, 'getOrFetchStreamSlice')
        .mockResolvedValue({
          nextPageIds,
          cacheMissUserIds: [],
          skip,
        });

      const fetchMissingUsersSpy = vi.spyOn(Core.FollowingStreamApplication, 'fetchMissingUsersFromNexus');

      const result = await StreamFollowingController.getOrFetchStreamSlice({
        streamId,
        user_id: userId,
        limit: 10,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        user_id: userId,
        limit: 10,
        skip: undefined,
      });
      expect(fetchMissingUsersSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        nextPageIds,
        skip,
      });
    });

    it('should fetch missing users when cacheMissUserIds exist', async () => {
      const nextPageIds: Core.Pubky[] = ['user-1' as Core.Pubky, 'user-2' as Core.Pubky];
      const cacheMissUserIds: Core.Pubky[] = ['user-3' as Core.Pubky, 'user-4' as Core.Pubky];
      const skip = 10;

      const getOrFetchStreamSliceSpy = vi
        .spyOn(Core.FollowingStreamApplication, 'getOrFetchStreamSlice')
        .mockResolvedValue({
          nextPageIds,
          cacheMissUserIds,
          skip,
        });

      const fetchMissingUsersSpy = vi
        .spyOn(Core.FollowingStreamApplication, 'fetchMissingUsersFromNexus')
        .mockResolvedValue();

      const result = await StreamFollowingController.getOrFetchStreamSlice({
        streamId,
        user_id: userId,
        limit: 10,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        user_id: userId,
        limit: 10,
        skip: undefined,
      });
      expect(Core.useAuthStore.getState().selectCurrentUserPubky).toHaveBeenCalled();
      expect(fetchMissingUsersSpy).toHaveBeenCalledWith({
        cacheMissUserIds,
        viewerId,
      });
      expect(result).toEqual({
        nextPageIds,
        skip,
      });
    });

    it('should pass skip to getOrFetchStreamSlice', async () => {
      const nextPageIds: Core.Pubky[] = ['user-5' as Core.Pubky, 'user-6' as Core.Pubky];
      const skip = 5;

      const getOrFetchStreamSliceSpy = vi
        .spyOn(Core.FollowingStreamApplication, 'getOrFetchStreamSlice')
        .mockResolvedValue({
          nextPageIds,
          cacheMissUserIds: [],
          skip: 10,
        });

      const result = await StreamFollowingController.getOrFetchStreamSlice({
        streamId,
        user_id: userId,
        skip,
        limit: 10,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        user_id: userId,
        limit: 10,
        skip,
      });
      expect(result.nextPageIds).toEqual(nextPageIds);
      expect(result.skip).toBe(10);
    });

    it('should use default limit when not provided', async () => {
      const nextPageIds: Core.Pubky[] = ['user-1' as Core.Pubky];
      const getOrFetchStreamSliceSpy = vi
        .spyOn(Core.FollowingStreamApplication, 'getOrFetchStreamSlice')
        .mockResolvedValue({
          nextPageIds,
          cacheMissUserIds: [],
          skip: undefined,
        });

      await StreamFollowingController.getOrFetchStreamSlice({
        streamId,
        user_id: userId,
      });

      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith({
        streamId,
        user_id: userId,
        limit: Config.NEXUS_USERS_PER_PAGE,
        skip: undefined,
      });
    });

    it('should not fetch missing users when cacheMissUserIds is empty array', async () => {
      const nextPageIds: Core.Pubky[] = ['user-1' as Core.Pubky, 'user-2' as Core.Pubky];
      const skip = 10;

      vi.spyOn(Core.FollowingStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissUserIds: [],
        skip,
      });

      const fetchMissingUsersSpy = vi.spyOn(Core.FollowingStreamApplication, 'fetchMissingUsersFromNexus');
      const selectCurrentUserPubkySpy = vi.spyOn(Core.useAuthStore.getState(), 'selectCurrentUserPubky');

      await StreamFollowingController.getOrFetchStreamSlice({
        streamId,
        user_id: userId,
        limit: 10,
      });

      expect(selectCurrentUserPubkySpy).not.toHaveBeenCalled();
      expect(fetchMissingUsersSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined skip in response', async () => {
      const nextPageIds: Core.Pubky[] = ['user-1' as Core.Pubky];

      vi.spyOn(Core.FollowingStreamApplication, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds,
        cacheMissUserIds: [],
        skip: undefined,
      });

      const result = await StreamFollowingController.getOrFetchStreamSlice({
        streamId,
        user_id: userId,
        limit: 10,
      });

      expect(result.skip).toBeUndefined();
      expect(result.nextPageIds).toEqual(nextPageIds);
    });
  });
});
