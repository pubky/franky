import * as Core from '@/core';
import * as Config from '@/config';

/**
 * Stream Followers Controller
 *
 * Handles followers stream requests from the UI layer.
 * Coordinates between application layer and manages background data fetching.
 *
 * This is a completely independent system separate from the following stream
 * and the existing user system.
 */
export class StreamFollowersController {
  private constructor() {}

  /**
   * Get or fetch a slice of a followers stream
   *
   * @param streamId - Followers stream identifier
   * @param user_id - ID of the user whose followers are being fetched
   * @param skip - Number of users to skip (for pagination)
   * @param limit - Number of users to return
   * @returns Next page of user IDs and pagination offset
   */
  static async getOrFetchStreamSlice({
    streamId,
    user_id,
    skip,
    limit = Config.NEXUS_USERS_PER_PAGE,
  }: Core.TReadFollowersStreamChunkParams): Promise<Core.TReadFollowersStreamChunkResponse> {
    const {
      nextPageIds,
      cacheMissUserIds,
      skip: nextSkip,
    } = await Core.FollowersStreamApplication.getOrFetchStreamSlice({
      streamId,
      user_id,
      skip,
      limit,
    });

    // Background fetch for missing users (non-blocking)
    if (cacheMissUserIds.length > 0) {
      const viewerId = Core.useAuthStore.getState().selectCurrentUserPubky();
      await Core.FollowersStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId,
      });
    }

    return { nextPageIds, skip: nextSkip };
  }
}
