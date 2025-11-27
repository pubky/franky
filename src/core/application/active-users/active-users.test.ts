import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { ActiveUsersApplication } from './active-users';

describe('ActiveUsersApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrFetch', () => {
    it('should fetch active users and return them', async () => {
      const mockUserIds = ['user1', 'user2', 'user3'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 10,
      };

      // Mock cache miss
      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(fetchSpy).toHaveBeenCalledWith(params);
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('should pass pagination params to service', async () => {
      const mockUserIds = ['user4'];

      const params: Core.TUserStreamInfluencersParams = {
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
        skip: 10,
        limit: 20,
      };

      // When skip > 0, bypasses cache
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(fetchSpy).toHaveBeenCalledWith(params);
    });

    it('should return empty array when service fails', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockRejectedValue(new Error('service-fail'));

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual([]);
    });

    it('should return empty array when service returns empty array', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue([]);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual([]);
    });

    it('should handle AppError and return empty array', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      const appError = Libs.createCommonError(Libs.CommonErrorType.NETWORK_ERROR, 'Network error', 500, {});
      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockRejectedValue(appError);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual([]);
    });

    it('should log error when service fails', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      const error = new Error('service-fail');
      const loggerSpy = vi.spyOn(Libs.Logger, 'error');
      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockRejectedValue(error);

      await ActiveUsersApplication.getOrFetch(params);

      expect(loggerSpy).toHaveBeenCalledWith('Error in ActiveUsersApplication.getOrFetch:', error);
    });

    it('should handle user_id parameter', async () => {
      const mockUserIds = ['user1'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        user_id: 'user-123',
      };

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(fetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle viewer_id parameter', async () => {
      const mockUserIds = ['user1'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        viewer_id: 'viewer-123',
      };

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(fetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle limit: 0', async () => {
      const mockUserIds: Core.Pubky[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 0,
      };

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(fetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle skip: 0', async () => {
      const mockUserIds: Core.Pubky[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        skip: 0,
      };

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(fetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle large limit values', async () => {
      const mockUserIds: Core.Pubky[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 9999,
      };

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(fetchSpy).toHaveBeenCalledWith(params);
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

      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(mockUserIds);
      expect(fetchSpy).toHaveBeenCalledWith(params);
    });

    it('should handle different reach values', async () => {
      const mockUserIds: Core.Pubky[] = [];

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      await ActiveUsersApplication.getOrFetch({
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await ActiveUsersApplication.getOrFetch({
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await ActiveUsersApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle different timeframe values', async () => {
      const mockUserIds: Core.Pubky[] = [];

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(mockUserIds);

      await ActiveUsersApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });
      await ActiveUsersApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.THIS_MONTH });
      await ActiveUsersApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.ALL_TIME });

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('should return cached data when available', async () => {
      const cachedUserIds = ['cached-user1', 'cached-user2'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 10,
      };

      const cachedModel = {
        id: 'today:all',
        userIds: cachedUserIds,
      } as Core.ActiveUsersModel;

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(cachedModel);
      vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue([]);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(cachedUserIds);
    });

    it('should apply limit to cached data', async () => {
      const cachedUserIds = ['user1', 'user2', 'user3', 'user4', 'user5'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 2,
      };

      const cachedModel = {
        id: 'today:all',
        userIds: cachedUserIds,
      } as Core.ActiveUsersModel;

      vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(cachedModel);
      vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue([]);
      vi.spyOn(Core.LocalActiveUsersService, 'upsert').mockResolvedValue(undefined);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(['user1', 'user2']);
    });

    it('should skip cache when skip > 0', async () => {
      const fetchedUserIds = ['fetched-user1', 'fetched-user2'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        skip: 5,
        limit: 10,
      };

      const findByIdSpy = vi.spyOn(Core.LocalActiveUsersService, 'findById');
      const fetchSpy = vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue(fetchedUserIds);

      const result = await ActiveUsersApplication.getOrFetch(params);

      expect(result).toEqual(fetchedUserIds);
      expect(findByIdSpy).not.toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalledWith(params);
    });

    it('should build correct composite ID from params', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
      };

      const findByIdSpy = vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue([]);

      await ActiveUsersApplication.getOrFetch(params);

      expect(findByIdSpy).toHaveBeenCalledWith('this_month:friends');
    });

    it('should use default timeframe and reach when not provided', async () => {
      const params: Core.TUserStreamInfluencersParams = {};

      const findByIdSpy = vi.spyOn(Core.LocalActiveUsersService, 'findById').mockResolvedValue(null);
      vi.spyOn(Core.NexusActiveUsersService, 'fetch').mockResolvedValue([]);

      await ActiveUsersApplication.getOrFetch(params);

      expect(findByIdSpy).toHaveBeenCalledWith('today:all');
    });
  });
});
