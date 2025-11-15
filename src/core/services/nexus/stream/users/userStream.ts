import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus User Stream Service
 *
 * Handles fetching user stream data from Nexus API.
 */
export class NexusUserStreamService {
  /**
   * Fetches user stream data from Nexus API
   *
   * @param streamId - Composite stream identifier (e.g., 'user123:followers', 'influencers:today:all')
   * @param params - Pagination parameters (skip, limit)
   * @returns Array of NexusUser objects
   */
  static async fetch({ streamId, params }: Core.TFetchUserStreamParams): Promise<Core.NexusUser[]> {
    const { reach, apiParams } = Core.createUserStreamParams(streamId, params);

    let url: string;

    // Type-safe dispatch - apiParams type is correctly mapped via UserStreamApiParamsMap
    switch (reach) {
      case 'followers':
      case 'following':
      case 'friends':
      case 'muted':
      case 'recommended':
        url = Core.userStreamApi[reach](apiParams as Core.TUserStreamWithUserIdParams);
        break;
      case 'influencers':
        url = Core.userStreamApi.influencers(apiParams as Core.TUserStreamInfluencersParams);
        break;
      case 'most_followed':
        url = Core.userStreamApi.mostFollowed(apiParams as Core.TUserStreamBase);
        break;
      default:
        throw new Error(`Invalid reach type: ${reach}`);
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
