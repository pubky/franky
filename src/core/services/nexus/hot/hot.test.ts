import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { NexusHotService } from './hot';

describe('NexusHotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetch', () => {
    it('should fetch hot tags successfully', async () => {
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

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockHotTags);

      const result = await NexusHotService.fetch(params);

      expect(result).toEqual(mockHotTags);
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should fetch with pagination params', async () => {
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

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockHotTags);

      const result = await NexusHotService.fetch(params);

      expect(result).toEqual(mockHotTags);
      expect(queryNexusSpy).toHaveBeenCalledOnce();
    });

    it('should return empty array when response is null', async () => {
      const params: Core.TTagHotParams = {
        timeframe: Core.UserStreamTimeframe.ALL_TIME,
      };

      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      const result = await NexusHotService.fetch(params);

      expect(result).toEqual([]);
    });

    it('should bubble when queryNexus fails', async () => {
      const params: Core.TTagHotParams = {
        reach: Core.UserStreamReach.FOLLOWING,
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      vi.spyOn(Core, 'queryNexus').mockRejectedValue(new Error('nexus-fail'));

      await expect(NexusHotService.fetch(params)).rejects.toThrow('nexus-fail');
    });

    it('should handle different reach values', async () => {
      const mockHotTags = [] as Core.NexusHotTag[];
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockHotTags);

      await NexusHotService.fetch({ reach: Core.UserStreamReach.FOLLOWING, timeframe: Core.UserStreamTimeframe.TODAY });
      await NexusHotService.fetch({ reach: Core.UserStreamReach.FRIENDS, timeframe: Core.UserStreamTimeframe.TODAY });
      await NexusHotService.fetch({ timeframe: Core.UserStreamTimeframe.TODAY });

      expect(queryNexusSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle different timeframe values', async () => {
      const mockHotTags = [] as Core.NexusHotTag[];
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockHotTags);

      await NexusHotService.fetch({ timeframe: Core.UserStreamTimeframe.TODAY });
      await NexusHotService.fetch({ timeframe: Core.UserStreamTimeframe.THIS_MONTH });
      await NexusHotService.fetch({ timeframe: Core.UserStreamTimeframe.ALL_TIME });

      expect(queryNexusSpy).toHaveBeenCalledTimes(3);
    });
  });
});
