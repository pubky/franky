import * as Core from '@/core';
import * as Libs from '@/libs';

export class HotApplication {
  private constructor() {}

  /**
   * Generates a cache key based on the query parameters
   *
   * @param params - Tag hot params
   * @returns Cache key string
   */
  private static getCacheKey(params: Core.TTagHotParams): string {
    const timeframe = params.timeframe || Core.UserStreamTimeframe.TODAY;
    const reach = params.reach || 'all';

    // Build a cache key from timeframe and reach
    // e.g., "today:all", "today:followers", "month:friends"
    const timeframeMap: Record<Core.UserStreamTimeframe, string> = {
      [Core.UserStreamTimeframe.TODAY]: 'today',
      [Core.UserStreamTimeframe.THIS_MONTH]: 'month',
      [Core.UserStreamTimeframe.ALL_TIME]: 'all',
    };

    return `${timeframeMap[timeframe]}:${reach}`;
  }

  /**
   * Gets hot tags from cache or fetches from Nexus API with IndexedDB persistence
   *
   * @param params - Parameters for fetching hot tags (includes reach, timeframe, skip, limit)
   * @returns Array of hot tags
   */
  static async getOrFetch(params: Core.TTagHotParams): Promise<Core.NexusHotTag[]> {
    try {
      const cacheKey = this.getCacheKey(params);

      // Try to get from cache first
      const cached = await Core.LocalHotService.findById(cacheKey);

      if (cached && cached.stream.length > 0) {
        Libs.Logger.debug('Hot tags retrieved from cache', { cacheKey, count: cached.stream.length });
        return cached.stream;
      }

      // Cache miss or empty - fetch from Nexus
      const hotTags = await Core.NexusHotService.fetch(params);

      // Persist to IndexedDB for future requests
      if (hotTags.length > 0) {
        await Core.LocalHotService.upsert(cacheKey, hotTags);
        Libs.Logger.debug('Hot tags persisted to cache', { cacheKey, count: hotTags.length });
      }

      return hotTags;
    } catch (error) {
      Libs.Logger.error('Error in HotApplication.getOrFetch:', error);
      return [];
    }
  }
}
