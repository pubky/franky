import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { ActiveUsersController } from './active-users';

describe('ActiveUsersController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrFetch', () => {
    it('should delegate to ActiveUsersApplication.getOrFetch', async () => {
      const mockUserIds = ['user1', 'user2', 'user3'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 10,
      };

      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersController.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
      expect(getOrFetchSpy).toHaveBeenCalledOnce();
    });

    it('should pass pagination params correctly', async () => {
      const mockUserIds: Core.Pubky[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
        skip: 10,
        limit: 20,
      };

      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      await ActiveUsersController.getOrFetch(params);

      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
    });

    it('should bubble when ActiveUsersApplication.getOrFetch fails', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockRejectedValue(new Error('application-fail'));

      await expect(ActiveUsersController.getOrFetch(params)).rejects.toThrow('application-fail');
    });

    it('should return empty array when application returns empty array', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue([]);

      const result = await ActiveUsersController.getOrFetch(params);

      expect(result).toEqual([]);
    });

    it('should handle user_id parameter', async () => {
      const mockUserIds = ['user1'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        user_id: 'user-123',
      };

      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersController.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle viewer_id parameter', async () => {
      const mockUserIds = ['user1'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        viewer_id: 'viewer-123',
      };

      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersController.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle limit: 0', async () => {
      const mockUserIds: Core.Pubky[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 0,
      };

      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersController.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle skip: 0', async () => {
      const mockUserIds: Core.Pubky[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        skip: 0,
      };

      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersController.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle large limit values', async () => {
      const mockUserIds: Core.Pubky[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 1000,
      };

      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersController.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle all optional parameters together', async () => {
      const mockUserIds = ['user1', 'user2', 'user3'];

      const params: Core.TUserStreamInfluencersParams = {
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
        skip: 5,
        limit: 25,
        user_id: 'user-456',
        viewer_id: 'viewer-789',
      };

      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersController.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle different reach values', async () => {
      const mockUserIds: Core.Pubky[] = [];
      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      await ActiveUsersController.getOrFetch({
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await ActiveUsersController.getOrFetch({
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await ActiveUsersController.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });

      expect(getOrFetchSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle different timeframe values', async () => {
      const mockUserIds: Core.Pubky[] = [];
      const getOrFetchSpy = vi.spyOn(Core.ActiveUsersApplication, 'getOrFetch').mockResolvedValue(mockUserIds);

      await ActiveUsersController.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });
      await ActiveUsersController.getOrFetch({ timeframe: Core.UserStreamTimeframe.THIS_MONTH });
      await ActiveUsersController.getOrFetch({ timeframe: Core.UserStreamTimeframe.ALL_TIME });

      expect(getOrFetchSpy).toHaveBeenCalledTimes(3);
    });
  });
});
