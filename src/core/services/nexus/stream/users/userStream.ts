import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus User Stream Service
 *
 * Handles fetching user stream data from Nexus API.
 */
export class NexusUserStreamService {
  /**
   * Fetches user stream data from Nexus API based on streamId
   *
   * @param streamId - User stream identifier (e.g., 'followers:today:all', 'following:today:all')
   * @param user_id - ID of the user whose stream is being fetched
   * @param params - Pagination parameters (skip, limit)
   * @returns Array of NexusUser objects
   */
  static async fetch({ streamId, user_id, params }: Core.TFetchUserStreamParams): Promise<Core.NexusUser[]> {
    const { skip, limit } = params;

    // Parse streamId to determine stream type
    // Format: 'followers:today:all' or 'following:today:all' or 'friends:today:all'
    const streamParts = streamId.split(':');
    const streamType = streamParts[0]; // 'followers', 'following', 'friends', etc.

    let url: string;

    switch (streamType) {
      case 'followers':
        url = Core.userStreamApi.followers({
          user_id,
          skip,
          limit,
        });
        break;
      case 'following':
        url = Core.userStreamApi.following({
          user_id,
          skip,
          limit,
        });
        break;
      case 'friends':
        url = Core.userStreamApi.friends({
          user_id,
          skip,
          limit,
        });
        break;
      case 'muted':
        url = Core.userStreamApi.muted({
          user_id,
          skip,
          limit,
        });
        break;
      case 'recommended':
        url = Core.userStreamApi.recommended({
          user_id,
          skip,
          limit,
        });
        break;
      default:
        throw new Error(`Invalid stream type for user stream: ${streamType}`);
    }

    const users = await Core.queryNexus<Core.NexusUser[]>(url);
    return users || [];
  }

  /**
   * Fetches user stream data from Nexus API by user IDs
   *
   * @param params - Parameters for fetching user stream data
   * @returns User stream data
   */
  static async fetchByIds(params: Core.TUserStreamUsersByIdsParams): Promise<Core.NexusUser[]> {
    if (params.user_ids.length === 0) {
      return [];
    }
    const url = Core.userStreamApi.usersByIds(params);
    let response = await Core.queryNexus<Core.NexusUser[]>(url.url, 'POST', JSON.stringify(url.body));
    if (!response) response = [];
    Libs.Logger.debug('Users fetched successfully', { response });

    return response;
  }
}
