import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { HotApplication } from './hot';

describe('HotApplication', () => {
  beforeEach(async () => {
    await Core.db.initialize();
    await Core.TagStreamModel.table.clear();
    vi.clearAllMocks();
  });

  describe('getOrFetch', () => {
    it('should fetch hot tags from Nexus and persist to IndexedDB', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'bitcoin',
          tagged_count: 100,
          taggers_count: 2,
          taggers_id: ['user1' as Core.Pubky, 'user2' as Core.Pubky],
        },
        {
          label: 'pubky',
          tagged_count: 50,
          taggers_count: 1,
          taggers_id: ['user3' as Core.Pubky],
        },
      ];

      const params: Core.TTagHotParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
        limit: 10,
      };

      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue(mockHotTags);
      const upsertSpy = vi.spyOn(Core.LocalHotService, 'upsert');

      const result = await HotApplication.getOrFetch(params);

      expect(result).toEqual(mockHotTags);
      expect(fetchSpy).toHaveBeenCalledWith(params);
      expect(fetchSpy).toHaveBeenCalledOnce();
      expect(upsertSpy).toHaveBeenCalledWith('today:all', mockHotTags);
    });

    it('should return cached data if available and skip Nexus fetch', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'cached-tag',
          tagged_count: 25,
          taggers_count: 1,
          taggers_id: ['user5' as Core.Pubky],
        },
      ];

      const params: Core.TTagHotParams = {
        timeframe: Core.UserStreamTimeframe.TODAY,
      };

      // Pre-populate cache with key "today:all" (default timeframe:reach)
      await Core.LocalHotService.upsert('today:all', mockHotTags);

      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch');

      const result = await HotApplication.getOrFetch(params);

      expect(result).toEqual(mockHotTags);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should fetch from Nexus when cache is empty', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'music',
          tagged_count: 75,
          taggers_count: 1,
          taggers_id: ['user4' as Core.Pubky],
        },
      ];

      const params: Core.TTagHotParams = {
        reach: Core.UserStreamReach.FRIENDS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
        skip: 10,
        limit: 20,
      };

      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue(mockHotTags);
      const upsertSpy = vi.spyOn(Core.LocalHotService, 'upsert');

      const result = await HotApplication.getOrFetch(params);

      expect(result).toEqual(mockHotTags);
      expect(fetchSpy).toHaveBeenCalledWith(params);
      expect(upsertSpy).toHaveBeenCalledWith('month:friends', mockHotTags);
    });

    it('should not persist empty results to cache', async () => {
      const params: Core.TTagHotParams = {
        timeframe: Core.UserStreamTimeframe.ALL_TIME,
      };

      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue([]);
      const upsertSpy = vi.spyOn(Core.LocalHotService, 'upsert');

      const result = await HotApplication.getOrFetch(params);

      expect(result).toEqual([]);
      expect(fetchSpy).toHaveBeenCalled();
      expect(upsertSpy).not.toHaveBeenCalled();
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

    it('should use different cache keys for different params', async () => {
      const mockHotTags: Core.NexusHotTag[] = [
        {
          label: 'test',
          tagged_count: 10,
          taggers_count: 1,
          taggers_id: ['user1' as Core.Pubky],
        },
      ];
      const fetchSpy = vi.spyOn(Core.NexusHotService, 'fetch').mockResolvedValue(mockHotTags);
      const upsertSpy = vi.spyOn(Core.LocalHotService, 'upsert');

      // Different timeframe/reach combinations should use different cache keys
      await HotApplication.getOrFetch({ timeframe: Core.UserStreamTimeframe.TODAY });
      await HotApplication.getOrFetch({
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
        reach: Core.UserStreamReach.FRIENDS,
      });
      await HotApplication.getOrFetch({
        timeframe: Core.UserStreamTimeframe.ALL_TIME,
        reach: Core.UserStreamReach.FOLLOWERS,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(upsertSpy).toHaveBeenCalledWith('today:all', mockHotTags);
      expect(upsertSpy).toHaveBeenCalledWith('month:friends', mockHotTags);
      expect(upsertSpy).toHaveBeenCalledWith('all:followers', mockHotTags);
    });
  });
});
