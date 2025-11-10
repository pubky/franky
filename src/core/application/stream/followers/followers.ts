import * as Core from '@/core';
import * as Config from '@/config';

/**
 * Followers Stream Application
 *
 * Manages followers stream data flow between Nexus API and local cache.
 * Handles followers lists with cache-first strategy.
 *
 * This is a completely independent system separate from the following stream
 * and the existing user system.
 */
export class FollowersStreamApplication {
  private constructor() {}

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get or fetch a slice of a followers stream
   * Uses cache-first strategy with fallback to Nexus API
   *
   * @param streamId - Followers stream identifier (e.g., 'followers:today:all')
   * @param user_id - ID of the user whose followers are being fetched
   * @param skip - Number of users to skip (for pagination)
   * @param limit - Number of users to return
   * @returns Next page of user IDs, cache miss IDs, and pagination offset
   */
  static async getOrFetchStreamSlice({
    streamId,
    user_id,
    skip = 0,
    limit = Config.NEXUS_USERS_PER_PAGE,
  }: Core.TReadFollowersStreamChunkParams): Promise<Core.TFollowersStreamChunkResponse> {
    // Try cache first
    const cachedStream = await Core.LocalStreamFollowersService.findById(streamId);
    if (cachedStream) {
      const nextPageIds = this.getStreamFromCache({ skip, limit, cachedStream });
      if (nextPageIds) {
        // Cache hit - return undefined skip to signal cache source
        return { nextPageIds, cacheMissUserIds: [], skip: undefined };
      }
    }

    // Cache miss - fetch from Nexus
    return await this.fetchStreamFromNexus({ streamId, user_id, skip, limit });
  }

  /**
   * Fetch missing user details from Nexus
   * Called in background to populate cache with full user data
   *
   * @param cacheMissUserIds - Array of user IDs that need to be fetched
   * @param viewerId - Optional viewer ID for relationship data
   */
  static async fetchMissingUsersFromNexus({ cacheMissUserIds, viewerId }: Core.TMissingFollowersParams): Promise<void> {
    if (cacheMissUserIds.length === 0) {
      return;
    }

    const { url, body } = Core.userStreamApi.usersByIds({
      user_ids: cacheMissUserIds,
      viewer_id: viewerId,
    });

    const userBatch = await Core.queryNexus<Core.NexusUser[]>(url, 'POST', JSON.stringify(body));
    if (userBatch) {
      await Core.LocalStreamFollowersService.persistUsers(userBatch);
    }
  }

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  /**
   * Fetch followers stream from Nexus API
   * Persists both stream IDs and full user data
   *
   * @private
   */
  private static async fetchStreamFromNexus({
    streamId,
    user_id,
    skip = 0,
    limit = Config.NEXUS_USERS_PER_PAGE,
  }: Core.TReadFollowersStreamChunkParams): Promise<Core.TFollowersStreamChunkResponse> {
    // Fetch from Nexus
    const nexusUsers = await Core.NexusFollowersStreamService.fetch({
      streamId,
      user_id,
      params: { skip, limit },
    });

    // Handle empty response
    if (nexusUsers.length === 0) {
      return { nextPageIds: [], cacheMissUserIds: [], skip: undefined };
    }

    // Extract user IDs
    const userIds = nexusUsers.map((user) => user.details.id);

    // Persist full user data to IndexedDB
    await Core.LocalStreamFollowersService.persistUsers(nexusUsers);

    // Check if stream exists in cache
    const existingStream = await Core.LocalStreamFollowersService.findById(streamId);

    if (existingStream) {
      // Append to existing stream
      await Core.LocalStreamFollowersService.persistNewStreamChunk({ stream: userIds, streamId });
    } else {
      // Create new stream
      await Core.LocalStreamFollowersService.upsert({ streamId, stream: userIds });
    }

    // Identify users not yet in cache (shouldn't be any now, but keep for consistency)
    const cacheMissUserIds = await this.getNotPersistedUsersInCache(userIds);

    // Calculate next skip value
    const nextSkip = skip + nexusUsers.length;

    return { nextPageIds: userIds, cacheMissUserIds, skip: nextSkip };
  }

  /**
   * Get followers stream slice from cache
   * Returns null if cache doesn't have sufficient data
   *
   * @private
   */
  private static getStreamFromCache({
    skip = 0,
    limit,
    cachedStream,
  }: Core.TCacheFollowersStreamParams): Core.Pubky[] | null {
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
