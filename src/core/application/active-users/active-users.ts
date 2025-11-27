import * as Core from '@/core';
import * as Libs from '@/libs';

export class ActiveUsersApplication {
  private constructor() {}

  /**
   * Get or fetch active users with cache-first strategy
   *
   * 1. Build stream ID from timeframe and reach parameters
   * 2. Check local cache first (skip if pagination)
   * 3. Return cached data immediately if found
   * 4. Fetch from Nexus API on cache miss
   * 5. Store fetched data in IndexedDB for future requests
   *
   * @param params - Parameters for fetching active users (includes reach, timeframe, skip, limit)
   * @returns Array of active user IDs
   */
  static async getOrFetch(params: Core.TUserStreamInfluencersParams): Promise<Core.Pubky[]> {
    try {
      // Build composite ID from params: timeframe:reach
      const timeframe = params.timeframe || Core.UserStreamTimeframe.TODAY;
      const reach = params.reach || 'all';

      const id = Core.buildActiveUsersId(timeframe, reach);

      // Skip cache for pagination
      if (params.skip && params.skip > 0) {
        Libs.Logger.debug('Fetching active users from Nexus (pagination)', { id, skip: params.skip });
        return await Core.NexusActiveUsersService.fetch(params);
      }

      // Check cache first
      const cached = await Core.LocalActiveUsersService.findById(id);

      if (cached && cached.userIds.length > 0) {
        Libs.Logger.debug('Active users cache hit', { id, count: cached.userIds.length });

        // Apply limit if specified
        const userIds = params.limit ? cached.userIds.slice(0, params.limit) : cached.userIds;

        // Optionally refresh cache in background (fire and forget)
        this.refreshCacheInBackground(id, params);

        return userIds;
      }

      // Cache miss - fetch from Nexus
      Libs.Logger.debug('Active users cache miss, fetching from Nexus', { id });
      const userIds = await Core.NexusActiveUsersService.fetch(params);

      // Store in cache (fire and forget)
      if (userIds.length > 0) {
        Core.LocalActiveUsersService.upsert(id, userIds).catch((error) => {
          Libs.Logger.error('Failed to cache active users', { id, error });
        });
      }

      return userIds;
    } catch (error) {
      Libs.Logger.error('Error in ActiveUsersApplication.getOrFetch:', error);
      return [];
    }
  }

  /**
   * Refreshes cache in background without blocking the response
   * This ensures users get cached data quickly while keeping cache fresh
   *
   * @private
   * @param id - Composite ID (timeframe:reach)
   * @param params - Parameters for fetching active users
   */
  private static refreshCacheInBackground(id: string, params: Core.TUserStreamInfluencersParams): void {
    Core.NexusActiveUsersService.fetch(params)
      .then((userIds) => {
        if (userIds.length > 0) {
          return Core.LocalActiveUsersService.upsert(id, userIds);
        }
      })
      .catch((error) => {
        Libs.Logger.debug('Background cache refresh failed (non-critical)', { id, error });
      });
  }
}
