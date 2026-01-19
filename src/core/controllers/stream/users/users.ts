import * as Core from '@/core';
import * as Config from '@/config';

/**
 * Stream User Controller
 *
 * Handles user stream requests from the UI layer.
 * Coordinates between application layer and manages background data fetching.
 * Supports followers, following, friends, and other user stream types.
 */
export class StreamUserController {
  private constructor() {}

  /**
   * Get or fetch a slice of a user stream (followers, following, friends, etc.)
   *
   * @param streamId - Composite user stream identifier (userId:reach) e.g., 'user123:followers'
   * @param skip - Number of users to skip (for pagination)
   * @param limit - Number of users to return
   * @param localOnly - When true, return cached data only, skip API fetch
   * @returns Next page of user IDs and pagination offset
   */
  static async getOrFetchStreamSlice({
    streamId,
    limit = Config.NEXUS_USERS_PER_PAGE,
    skip,
    localOnly,
  }: Core.TReadUserStreamChunkParams): Promise<Core.TReadUserStreamChunkResponse> {
    const viewerId = Core.useAuthStore.getState().selectCurrentUserPubky();

    const {
      nextPageIds,
      cacheMissUserIds,
      skip: nextSkip,
    } = await Core.UserStreamApplication.getOrFetchStreamSlice({
      streamId,
      skip,
      limit,
      viewerId,
      localOnly,
    });

    // Background fetch for missing users (non-blocking)
    if (cacheMissUserIds.length > 0) {
      // TODO: When TTL is implemented, we can return to void
      await Core.UserStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId,
      });
    }

    return { nextPageIds, skip: nextSkip };
  }
}
