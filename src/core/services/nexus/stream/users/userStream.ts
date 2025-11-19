import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus User Stream Service
 *
 * Handles fetching user stream data from Nexus API.
 */
export class NexusUserStreamService {
  /**
   * Fetches user IDs from Nexus API user stream endpoint
   *
   * @param streamId - Composite stream identifier (e.g., 'user123:followers', 'influencers:today:all')
   * @param params - Pagination parameters (skip, limit)
   * @returns Array of user IDs
   */
  static async fetch({ streamId, params }: Core.TFetchUserStreamParams): Promise<Core.Pubky[]> {
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

    const response = await Core.queryNexus<Core.NexusUserIdStream>(url);
    return response?.user_ids || [];
  }

  /**
   * Fetches full user details for the provided user IDs
   *
   * @param params - User IDs to fetch, optional viewer ID for relationship data
   * @returns Array of full user objects with details, counts, tags, and relationships
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
