import * as Core from '@/core';
import * as Config from '@/config';

/**
 * Stream Following Controller
 *
 * Handles following stream requests from the UI layer.
 * Coordinates between application layer and manages background data fetching.
 *
 * This is a completely independent system separate from the followers stream
 * and the existing user system.
 */
export class StreamFollowingController {
  private constructor() {}

  /**
   * Get or fetch a slice of a following stream
   *
   * @param streamId - Following stream identifier
   * @param user_id - ID of the user whose following are being fetched
   * @param skip - Number of users to skip (for pagination)
   * @param limit - Number of users to return
   * @returns Next page of user IDs and pagination offset
   */
  static async getOrFetchStreamSlice({
    streamId,
    user_id,
    skip,
    limit = Config.NEXUS_USERS_PER_PAGE,
  }: Core.TReadFollowingStreamChunkParams): Promise<Core.TReadFollowingStreamChunkResponse> {
    const {
      nextPageIds,
      cacheMissUserIds,
      skip: nextSkip,
    } = await Core.FollowingStreamApplication.getOrFetchStreamSlice({
      streamId,
      user_id,
      skip,
      limit,
    });

    // Background fetch for missing users (non-blocking)
    if (cacheMissUserIds.length > 0) {
      const viewerId = Core.useAuthStore.getState().selectCurrentUserPubky();
      await Core.FollowingStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId,
      });
    }

    return { nextPageIds, skip: nextSkip };
  }
}
