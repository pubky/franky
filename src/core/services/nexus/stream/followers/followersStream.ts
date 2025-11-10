import * as Core from '@/core';

/**
 * Nexus Followers Stream Service
 *
 * Handles fetching followers streams from the Nexus API.
 */
export class NexusFollowersStreamService {
  private constructor() {}

  /**
   * Fetch followers stream from Nexus API
   *
   * @param streamId - Followers stream identifier (e.g., 'followers:today:all')
   * @param user_id - ID of the user whose followers are being fetched
   * @param params - Pagination parameters (skip, limit)
   * @returns Array of NexusUser objects
   */
  static async fetch({ streamId, user_id, params }: Core.TFetchFollowersStreamParams): Promise<Core.NexusUser[]> {
    const { skip, limit } = params;

    // Parse streamId to determine stream type
    // Format: 'followers:today:all' or 'followers:today:following'
    const streamParts = streamId.split(':');
    const streamType = streamParts[0]; // 'followers'

    if (streamType !== 'followers') {
      throw new Error(`Invalid stream type for followers: ${streamType}`);
    }

    const url = Core.userStreamApi.followers({
      user_id,
      skip,
      limit,
    });

    const followers = await Core.queryNexus<Core.NexusUser[]>(url);
    return followers || [];
  }
}
