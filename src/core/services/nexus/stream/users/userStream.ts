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
   * @param params - Parameters for fetching user stream data
   * @returns User stream data
   */
  static async read(params: Core.TUserStreamUsersByIdsParams): Promise<Core.NexusUser[]> {
    try {
      // Convert offset to skip for Nexus API
      const apiParams = {
        ...params,
      };

      if (apiParams.user_ids.length === 0) {
        return [];
      }

      const url = Core.userStreamApi.usersByIds(apiParams);

      const response = await Core.queryNexus<Core.NexusUser[]>(url.url, 'POST', JSON.stringify(url.body));
      Libs.Logger.debug('Users fetched successfully', { response });

      return response;
    } catch (error) {
      Libs.Logger.error('Failed to fetch users', error);
      throw error;
    }
  }
}
