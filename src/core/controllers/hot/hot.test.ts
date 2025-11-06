import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { HotController } from './hot';

describe('HotController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrFetch', () => {
    it('should delegate to HotApplication.getOrFetch', async () => {
      const mockHotTags = [
        {
          label: 'bitcoin',
          tagged_count: 100,
          taggers_count: 2,
          taggers_id: ['user1', 'user2'],
        },
        {
          label: 'pubky',
          tagged_count: 50,
          taggers_count: 1,
          taggers_id: ['user3'],
        },
      ] as Core.NexusHotTag[];

      const params: Core.TTagHotParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 10,
      };

      const getOrFetchSpy = vi.spyOn(Core.HotApplication, 'getOrFetch').mockResolvedValue(mockHotTags);

      const result = await HotController.getOrFetch(params);

      expect(result).toEqual(mockHotTags);
      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
      expect(getOrFetchSpy).toHaveBeenCalledOnce();
    });

    it('should pass pagination params correctly', async () => {
      const mockHotTags = [] as Core.NexusHotTag[];

      const params: Core.TTagHotParams = {
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
        skip: 10,
        limit: 20,
      };

      const getOrFetchSpy = vi.spyOn(Core.HotApplication, 'getOrFetch').mockResolvedValue(mockHotTags);

      await HotController.getOrFetch(params);

      expect(getOrFetchSpy).toHaveBeenCalledWith(params);
    });

    it('should bubble when HotApplication.getOrFetch fails', async () => {
      const params: Core.TTagHotParams = {
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core.HotApplication, 'getOrFetch').mockRejectedValue(new Error('application-fail'));

      await expect(HotController.getOrFetch(params)).rejects.toThrow('application-fail');
    });

    it('should handle different reach values', async () => {
      const mockHotTags = [] as Core.NexusHotTag[];
      const getOrFetchSpy = vi.spyOn(Core.HotApplication, 'getOrFetch').mockResolvedValue(mockHotTags);

      await HotController.getOrFetch({
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await HotController.getOrFetch({
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await HotController.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });

      expect(getOrFetchSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle different timeframe values', async () => {
      const mockHotTags = [] as Core.NexusHotTag[];
      const getOrFetchSpy = vi.spyOn(Core.HotApplication, 'getOrFetch').mockResolvedValue(mockHotTags);

      await HotController.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });
      await HotController.getOrFetch({ timeframe: Core.UserStreamTimeframe.THIS_MONTH });
      await HotController.getOrFetch({ timeframe: Core.UserStreamTimeframe.ALL_TIME });

      expect(getOrFetchSpy).toHaveBeenCalledTimes(3);
    });
  });
});
