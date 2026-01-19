import * as Core from '@/core';
import * as Config from '@/config';

/**
 * Internal type for fetchStreamFromNexus parameters
 * Extends the internal fetch params type with optional cached stream data
 */

/**
 * User Stream Application
 *
 * Manages user stream data flow between Nexus API and local cache.
 * Handles followers, following, friends, and other user stream types with cache-first strategy.
 */
export class UserStreamApplication {
  private constructor() {}

  /**
   * Get or fetch a slice of a user stream (followers, following, friends, etc.)
   * Uses cache-first strategy with fallback to Nexus API
   *
   * @param streamId - User stream identifier (e.g., 'user123:followers', 'influencers:today:all')
   * @param skip - Number of users to skip (for pagination)
   * @param limit - Number of users to return
   * @param viewerId - The current authenticated user (for relationship data)
   * @param localOnly - When true, return cached data only, skip API fetch
   * @returns Next page of user IDs, cache miss IDs, and pagination offset
   */
  static async getOrFetchStreamSlice({
    streamId,
    skip,
    limit,
    viewerId,
    localOnly,
  }: Core.TFetchUserStreamChunkParams): Promise<Core.TUserStreamChunkResponse> {
    // Try cache first
    const cachedStream = await Core.LocalStreamUsersService.findById(streamId);
    if (cachedStream) {
      const nextPageIds = this.getStreamFromCache({ skip, limit, cachedStream });
      if (nextPageIds) {
        // Cache hit - return undefined skip to signal cache source
        return { nextPageIds, cacheMissUserIds: [], skip: undefined };
      }

      // Cache exists but incomplete; in localOnly mode, return available data
      if (localOnly) {
        const availableIds = cachedStream.stream.slice(skip);
        return { nextPageIds: availableIds, cacheMissUserIds: [], skip: undefined };
      }
    }

    if (localOnly) {
      return { nextPageIds: [], cacheMissUserIds: [], skip: undefined };
    }

    // Cache miss - fetch from Nexus
    return await this.fetchStreamFromNexus({ streamId, skip, limit, viewerId, cachedStream });
  }

  /**
   * Fetch missing user details from Nexus
   * Called in background to populate cache with full user data
   *
   * @param cacheMissUserIds - Array of user IDs that need to be fetched
   * @param viewerId - Optional viewer ID for relationship data
   */
  static async fetchMissingUsersFromNexus({ cacheMissUserIds, viewerId }: Core.TMissingUsersParams): Promise<void> {
    if (cacheMissUserIds.length === 0) {
      return;
    }

    try {
      const { url, body } = Core.userStreamApi.usersByIds({
        user_ids: cacheMissUserIds,
        viewer_id: viewerId,
      });

      const userBatch = await Core.queryNexus<Core.NexusUser[]>(url, 'POST', JSON.stringify(body));
      await Core.LocalStreamUsersService.persistUsers(userBatch);
    } catch (error) {
      console.error('Failed to fetch missing users from Nexus:', error);
    }
  }

  /**
   * Fetches user IDs from Nexus API and persists stream to cache
   * Returns IDs and identifies which users need full details fetched
   *
   * @private
   */
  private static async fetchStreamFromNexus({
    streamId,
    skip = 0,
    limit = Config.NEXUS_USERS_PER_PAGE,
    viewerId,
    cachedStream,
  }: Core.TFetchStreamFromNexusParams): Promise<Core.TUserStreamChunkResponse> {
    // Fetch user IDs from Nexus
    const userIds = await Core.NexusUserStreamService.fetch({
      streamId,
      params: { skip, limit, viewer_id: viewerId },
    });

    // Handle empty response
    if (userIds.length === 0) {
      return { nextPageIds: [], cacheMissUserIds: [], skip: undefined };
    }

    // Upsert stream (append to existing or create new)
    let stream = userIds;
    if (cachedStream) {
      // Filter out duplicates before appending
      const newUserIds = userIds.filter((id) => !cachedStream.stream.includes(id));
      stream = [...cachedStream.stream, ...newUserIds];
    }
    await Core.LocalStreamUsersService.upsert({ streamId, stream });

    // Identify users missing from cache that need full details fetched
    const cacheMissUserIds = await this.getNotPersistedUsersInCache(userIds);

    // Calculate next skip value for pagination
    const nextSkip = skip + userIds.length;

    return { nextPageIds: userIds, cacheMissUserIds, skip: nextSkip };
  }

  /**
   * Get user stream slice from cache
   * Returns null if cache doesn't have sufficient data
   *
   * @private
   */
  private static getStreamFromCache({
    skip = 0,
    limit,
    cachedStream,
  }: Core.TCacheUserStreamParams): Core.Pubky[] | null {
    // Check if cache has enough data for the requested range
    const endIndex = skip + limit;
    if (cachedStream.stream.length >= endIndex) {
      return cachedStream.stream.slice(skip, endIndex);
    }

    // Not enough data in cache
    return null;
  }

  /**
   * Find which users are not yet persisted in cache
   * Used to identify missing user data that needs to be fetched
   *
   * @private
   */
  private static async getNotPersistedUsersInCache(userIds: Core.Pubky[]): Promise<Core.Pubky[]> {
    return await Core.LocalStreamUsersService.getNotPersistedUsersInCache(userIds);
  }
}
