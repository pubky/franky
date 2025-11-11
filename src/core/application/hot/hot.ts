import * as Core from '@/core';
import * as Libs from '@/libs';

export class HotApplication {
  private constructor() {}

  /**
   * Get or fetch hot tags with cache-first strategy
   *
   * 1. Build stream ID from timeframe and reach parameters
   * 2. Check local cache first (skip if pagination)
   * 3. Return cached data immediately if found
   * 4. Fetch from Nexus API on cache miss
   * 5. Store fetched data in IndexedDB for future requests
   *
   * @param params - Parameters for fetching hot tags (includes reach, timeframe, skip, limit)
   * @returns Array of hot tags
   */
  static async getOrFetch(params: Core.TTagHotParams): Promise<Core.NexusHotTag[]> {
    try {
      // Build composite ID from params: timeframe:reach
      const timeframe = params.timeframe || Core.UserStreamTimeframe.TODAY;
      const reach = params.reach || 'all';

      // Map UserStreamTimeframe to Timeframe
      const mappedTimeframe =
        timeframe === Core.UserStreamTimeframe.THIS_MONTH
          ? Core.Timeframe.MONTH
          : timeframe === Core.UserStreamTimeframe.ALL_TIME
            ? Core.Timeframe.ALL
            : Core.Timeframe.TODAY;

      // Map reach string to Reach enum
      const mappedReach =
        reach === Core.UserStreamReach.FOLLOWERS
          ? Core.Reach.FOLLOWERS
          : reach === Core.UserStreamReach.FOLLOWING
            ? Core.Reach.FOLLOWING
            : reach === Core.UserStreamReach.FRIENDS
              ? Core.Reach.FRIENDS
              : reach === Core.UserStreamReach.WOT
                ? Core.Reach.WOT
                : Core.Reach.ALL;

      const id = Core.buildHotTagsId(mappedTimeframe, mappedReach);

      // Skip cache for pagination
      if (params.skip && params.skip > 0) {
        Libs.Logger.debug('Fetching hot tags from Nexus (pagination)', { id, skip: params.skip });
        return await Core.NexusHotService.fetch(params);
      }

      // Check cache first
      const cached = await Core.LocalHotService.findById(id);

      if (cached && cached.tags.length > 0) {
        Libs.Logger.debug('Hot tags cache hit', { id, count: cached.tags.length });

        // Apply limit if specified
        const tags = params.limit ? cached.tags.slice(0, params.limit) : cached.tags;

        // Optionally refresh cache in background (fire and forget)
        this.refreshCacheInBackground(id, params);

        return tags;
      }

      // Cache miss - fetch from Nexus
      Libs.Logger.debug('Hot tags cache miss, fetching from Nexus', { id });
      const tags = await Core.NexusHotService.fetch(params);

      // Store in cache (fire and forget)
      if (tags.length > 0) {
        Core.LocalHotService.upsert(id, tags).catch((error) => {
          Libs.Logger.error('Failed to cache hot tags', { id, error });
        });
      }

      return tags;
    } catch (error) {
      Libs.Logger.error('Error in HotApplication.getOrFetch:', error);
      return [];
    }
  }

  /**
   * Refreshes cache in background without blocking the response
   * This ensures users get cached data quickly while keeping cache fresh
   *
   * @private
   * @param id - Composite ID (timeframe:reach)
   * @param params - Parameters for fetching hot tags
   */
  private static refreshCacheInBackground(id: string, params: Core.TTagHotParams): void {
    Core.NexusHotService.fetch(params)
      .then((tags) => {
        if (tags.length > 0) {
          return Core.LocalHotService.upsert(id, tags);
        }
      })
      .catch((error) => {
        Libs.Logger.debug('Background cache refresh failed (non-critical)', { id, error });
      });
  }
}
