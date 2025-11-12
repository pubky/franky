import * as Core from '@/core';
import * as Config from '@/config';

/**
 * Internal type for fetchStreamFromNexus parameters
 * Extends the public params type with optional cached stream data
 */
type TFetchStreamFromNexusParams = Core.TReadUserStreamChunkParams & {
  cachedStream?: { stream: Core.Pubky[] } | null;
};

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
   * @returns Next page of user IDs, cache miss IDs, and pagination offset
   */
  static async getOrFetchStreamSlice({
    streamId,
    skip,
    limit,
    viewerId,
  }: Core.TReadUserStreamChunkParams): Promise<Core.TUserStreamChunkResponse> {
    // Try cache first
    const cachedStream = await Core.LocalStreamUsersService.findById(streamId);
    if (cachedStream) {
      const nextPageIds = this.getStreamFromCache({ skip, limit, cachedStream });
      if (nextPageIds) {
        // Cache hit - return undefined skip to signal cache source
        return { nextPageIds, cacheMissUserIds: [], skip: undefined };
      }
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

    const { url, body } = Core.userStreamApi.usersByIds({
      user_ids: cacheMissUserIds,
      viewer_id: viewerId,
    });

    const userBatch = await Core.queryNexus<Core.NexusUser[]>(url, 'POST', JSON.stringify(body));
    if (userBatch) {
      await Core.LocalStreamUsersService.persistUsers(userBatch);
    }
  }

  /**
   * Fetch user stream from Nexus API
   * Persists both stream IDs and full user data
   *
   * @private
   */
  private static async fetchStreamFromNexus({
    streamId,
    skip = 0,
    limit = Config.NEXUS_USERS_PER_PAGE,
    viewerId,
    cachedStream,
  }: TFetchStreamFromNexusParams): Promise<Core.TUserStreamChunkResponse> {
    const nexusUsers = await Core.NexusUserStreamService.fetch({
      streamId,
      params: { skip, limit, viewer_id: viewerId },
    });

    // Handle empty response
    if (nexusUsers.length === 0) {
      return { nextPageIds: [], cacheMissUserIds: [], skip: undefined };
    }

    // Extract user IDs
    const userIds = nexusUsers.map((user) => user.details.id);

    // Persist full user data to IndexedDB
    await Core.LocalStreamUsersService.persistUsers(nexusUsers);

    // Upsert stream (append to existing or create new)
    const updatedStream = cachedStream ? [...cachedStream.stream, ...userIds] : userIds;
    await Core.LocalStreamUsersService.upsert({ streamId, stream: updatedStream });

    // Identify users not yet in cache (shouldn't be any now, but keep for consistency)
    const cacheMissUserIds = await this.getNotPersistedUsersInCache(userIds);

    // Calculate next skip value
    const nextSkip = skip + nexusUsers.length;

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
    const existingUserIds = await Core.UserDetailsModel.findByIdsPreserveOrder(userIds);
    return userIds.filter((_userId, index) => existingUserIds[index] === undefined);
  }
}
