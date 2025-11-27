import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus Active Users Service
 *
 * Handles fetching active users (influencers) from Nexus API.
 * Uses the influencers stream endpoint with reach and timeframe filtering.
 */
export class NexusActiveUsersService {
  private constructor() {}

  /**
   * Fetches active users (influencers) from Nexus API
   *
   * @param params - Parameters for fetching active users (TActiveUsersParams with pagination and reach options)
   * @returns Array of user IDs representing active users
   */
  static async fetch(params: Core.TUserStreamInfluencersParams): Promise<Core.Pubky[]> {
    const url = Core.userStreamApi.influencers(params);
    const response = await Core.queryNexus<Core.NexusUserIdStream>(url);

    Libs.Logger.debug('Active users fetched successfully', { count: response?.user_ids?.length ?? 0 });

    return response?.user_ids || [];
  }
}
