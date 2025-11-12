import * as Core from '@/core';

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
   * @returns Next page of user IDs and pagination offset
   */
  static async getOrFetchStreamSlice({
    streamId,
    skip,
    limit,
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
    });

    // Background fetch for missing users (non-blocking)
    if (cacheMissUserIds.length > 0) {
      await Core.UserStreamApplication.fetchMissingUsersFromNexus({
        cacheMissUserIds,
        viewerId,
      });
    }

    return { nextPageIds, skip: nextSkip };
  }
}
