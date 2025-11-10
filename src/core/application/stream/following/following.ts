import * as Core from '@/core';
import * as Config from '@/config';

/**
 * Following Stream Application
 *
 * Manages following stream data flow between Nexus API and local cache.
 * Handles following lists with cache-first strategy.
 *
 * This is a completely independent system separate from the followers stream
 * and the existing user system.
 */
export class FollowingStreamApplication {
  private constructor() {}

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get or fetch a slice of a following stream
   * Uses cache-first strategy with fallback to Nexus API
   *
   * @param streamId - Following stream identifier (e.g., 'following:today:all')
   * @param user_id - ID of the user whose following are being fetched
   * @param skip - Number of users to skip (for pagination)
   * @param limit - Number of users to return
   * @returns Next page of user IDs, cache miss IDs, and pagination offset
   */
  static async getOrFetchStreamSlice({
    streamId,
    user_id,
    skip = 0,
    limit = Config.NEXUS_USERS_PER_PAGE,
  }: Core.TReadFollowingStreamChunkParams): Promise<Core.TFollowingStreamChunkResponse> {
    // Try cache first
    const cachedStream = await Core.LocalStreamFollowingService.findById(streamId);
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
  static async fetchMissingUsersFromNexus({ cacheMissUserIds, viewerId }: Core.TMissingFollowingParams): Promise<void> {
    if (cacheMissUserIds.length === 0) {
      return;
    }

    const { url, body } = Core.userStreamApi.usersByIds({
      user_ids: cacheMissUserIds,
      viewer_id: viewerId,
    });

    const userBatch = await Core.queryNexus<Core.NexusUser[]>(url, 'POST', JSON.stringify(body));
    if (userBatch) {
      await Core.LocalStreamFollowingService.persistUsers(userBatch);
    }
  }

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  /**
   * Fetch following stream from Nexus API
   * Persists both stream IDs and full user data
   *
   * @private
   */
  private static async fetchStreamFromNexus({
    streamId,
    user_id,
    skip = 0,
    limit = Config.NEXUS_USERS_PER_PAGE,
  }: Core.TReadFollowingStreamChunkParams): Promise<Core.TFollowingStreamChunkResponse> {
    // Fetch from Nexus
    const nexusUsers = await Core.NexusFollowingStreamService.fetch({
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
    await Core.LocalStreamFollowingService.persistUsers(nexusUsers);

    // Check if stream exists in cache
    const existingStream = await Core.LocalStreamFollowingService.findById(streamId);

    if (existingStream) {
      // Append to existing stream
      await Core.LocalStreamFollowingService.persistNewStreamChunk({ stream: userIds, streamId });
    } else {
      // Create new stream
      await Core.LocalStreamFollowingService.upsert({ streamId, stream: userIds });
    }

    // Identify users not yet in cache (shouldn't be any now, but keep for consistency)
    const cacheMissUserIds = await this.getNotPersistedUsersInCache(userIds);

    // Calculate next skip value
    const nextSkip = skip + nexusUsers.length;

    return { nextPageIds: userIds, cacheMissUserIds, skip: nextSkip };
  }

  /**
   * Get following stream slice from cache
   * Returns null if cache doesn't have sufficient data
   *
   * @private
   */
  private static getStreamFromCache({
    skip = 0,
    limit,
    cachedStream,
  }: Core.TCacheFollowingStreamParams): Core.Pubky[] | null {
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
