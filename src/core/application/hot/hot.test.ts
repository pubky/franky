import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { HotApplication } from './hot';

describe('HotApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrFetch', () => {
    it('should fetch hot tags and return them', async () => {
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

      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue(mockHotTags);

      const result = await HotApplication.getOrFetch(params);

      expect(result).toEqual(mockHotTags);
      expect(fetchSpy).toHaveBeenCalledWith(params);
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('should pass pagination params to service', async () => {
      const mockHotTags = [
        {
          label: 'music',
          tagged_count: 75,
          taggers_count: 1,
          taggers_id: ['user4'],
        },
      ] as Core.NexusHotTag[];

      const params: Core.TTagHotParams = {
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
        skip: 10,
        limit: 20,
      };

      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue(mockHotTags);

      const result = await HotApplication.getOrFetch(params);

      expect(result).toEqual(mockHotTags);
      expect(fetchSpy).toHaveBeenCalledWith(params);
    });

    it('should return empty array when service fails', async () => {
      const params: Core.TTagHotParams = {
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core.NexusHotService, 'fetch').mockRejectedValue(new Error('service-fail'));

      const result = await HotApplication.getOrFetch(params);

      expect(result).toEqual([]);
    });

    it('should handle different reach values', async () => {
      const mockHotTags = [] as Core.NexusHotTag[];
      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue(mockHotTags);

      await HotApplication.getOrFetch({
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await HotApplication.getOrFetch({
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.TODAY,
      });
      await HotApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle different timeframe values', async () => {
      const mockHotTags = [] as Core.NexusHotTag[];
      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue(mockHotTags);

      await HotApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });
      await HotApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.THIS_MONTH });
      await HotApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.ALL_TIME });

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });
  });
});
