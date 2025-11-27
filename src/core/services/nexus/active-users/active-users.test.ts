import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { NexusActiveUsersService } from './active-users.api';

describe('NexusActiveUsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetch', () => {
    it('should fetch active users successfully', async () => {
      const mockUserIds = ['user1', 'user2', 'user3'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 10,
      };

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual(mockUserIds);
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should fetch with pagination params', async () => {
      const mockUserIds = ['user4'];

      const params: Core.TUserStreamInfluencersParams = {
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
        skip: 10,
        limit: 20,
      };

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual(mockUserIds);
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should return empty array when response is null', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.ALL_TIME,
      };

      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual([]);
    });

    it('should return empty array when response is undefined', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.ALL_TIME,
      };

      vi.spyOn(Core, 'queryNexus').mockResolvedValue(undefined);

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual([]);
    });

    it('should return empty array when response has empty user_ids array', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: [] });

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual([]);
    });

    it('should return empty array when response has no user_ids property', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core, 'queryNexus').mockResolvedValue({});

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual([]);
    });

    it('should log debug message with count when fetch succeeds', async () => {
      const mockUserIds = ['user1', 'user2'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      const loggerSpy = vi.spyOn(Libs.Logger, 'debug');
      vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });

      await NexusActiveUsersService.fetch(params);

      expect(loggerSpy).toHaveBeenCalledWith('Active users fetched successfully', { count: 2 });
    });

    it('should log debug message with count 0 when response is null', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      const loggerSpy = vi.spyOn(Libs.Logger, 'debug');
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      await NexusActiveUsersService.fetch(params);

      expect(loggerSpy).toHaveBeenCalledWith('Active users fetched successfully', { count: 0 });
    });

    it('should handle user_id parameter', async () => {
      const mockUserIds = ['user1'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        user_id: 'user-123',
      };

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });
      const userStreamApiSpy = vi.spyOn(Core.userStreamApi, 'influencers');

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual(mockUserIds);
      expect(userStreamApiSpy).toHaveBeenCalled();
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should handle viewer_id parameter', async () => {
      const mockUserIds = ['user1'];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        viewer_id: 'viewer-123',
      };

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });
      const userStreamApiSpy = vi.spyOn(Core.userStreamApi, 'influencers');

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual(mockUserIds);
      expect(userStreamApiSpy).toHaveBeenCalled();
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should handle limit: 0', async () => {
      const mockUserIds: string[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 0,
      };

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });
      const userStreamApiSpy = vi.spyOn(Core.userStreamApi, 'influencers');

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual(mockUserIds);
      expect(userStreamApiSpy).toHaveBeenCalled();
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should handle skip: 0', async () => {
      const mockUserIds: string[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        skip: 0,
      };

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });
      const userStreamApiSpy = vi.spyOn(Core.userStreamApi, 'influencers');

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual(mockUserIds);
      expect(userStreamApiSpy).toHaveBeenCalled();
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should handle large limit values', async () => {
      const mockUserIds: string[] = [];

      const params: Core.TUserStreamInfluencersParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 10_000,
      };

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });
      const userStreamApiSpy = vi.spyOn(Core.userStreamApi, 'influencers');

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual(mockUserIds);
      expect(userStreamApiSpy).toHaveBeenCalled();
      expect(queryNexusSpy).toHaveBeenCalledOnce();
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

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });
      const userStreamApiSpy = vi.spyOn(Core.userStreamApi, 'influencers');

      const result = await NexusActiveUsersService.fetch(params);

      expect(result).toEqual(mockUserIds);
      expect(userStreamApiSpy).toHaveBeenCalled();
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should bubble when queryNexus fails', async () => {
      const params: Core.TUserStreamInfluencersParams = {
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core, 'queryNexus').mockRejectedValue(new Error('nexus-fail'));

      await expect(NexusActiveUsersService.fetch(params)).rejects.toThrow('nexus-fail');
    });

    it('should handle different reach values', async () => {
      const mockUserIds: string[] = [];
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });

      await NexusActiveUsersService.fetch({
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await NexusActiveUsersService.fetch({
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await NexusActiveUsersService.fetch({ timeframe: Core.UserStreamTimeframe.TODAY });

      expect(queryNexusSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle different timeframe values', async () => {
      const mockUserIds: string[] = [];
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue({ user_ids: mockUserIds });

      await NexusActiveUsersService.fetch({ timeframe: Core.UserStreamTimeframe.TODAY });
      await NexusActiveUsersService.fetch({ timeframe: Core.UserStreamTimeframe.THIS_MONTH });
      await NexusActiveUsersService.fetch({ timeframe: Core.UserStreamTimeframe.ALL_TIME });

      expect(queryNexusSpy).toHaveBeenCalledTimes(3);
    });
  });
});
