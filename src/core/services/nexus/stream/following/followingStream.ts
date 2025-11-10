import * as Core from '@/core';

/**
 * Nexus Following Stream Service
 *
 * Handles fetching following streams from the Nexus API.
 */
export class NexusFollowingStreamService {
  private constructor() {}

  /**
   * Fetch following stream from Nexus API
   *
   * @param streamId - Following stream identifier (e.g., 'following:today:all')
   * @param user_id - ID of the user whose following are being fetched
   * @param params - Pagination parameters (skip, limit)
   * @returns Array of NexusUser objects
   */
  static async fetch({ streamId, user_id, params }: Core.TFetchFollowingStreamParams): Promise<Core.NexusUser[]> {
    const { skip, limit } = params;

    // Parse streamId to determine stream type
    // Format: 'following:today:all' or 'following:today:following'
    const streamParts = streamId.split(':');
    const streamType = streamParts[0]; // 'following'

    if (streamType !== 'following') {
      throw new Error(`Invalid stream type for following: ${streamType}`);
    }

    const url = Core.userStreamApi.following({
      user_id,
      skip,
      limit,
    });

    const following = await Core.queryNexus<Core.NexusUser[]>(url);
    return following || [];
  }
}
