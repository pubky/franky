import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus Bootstrap Service
 *
 * Handles fetching bootstrap data from Nexus API.
 */
export class NexusBootstrapService {
  /**
   * Retrieves bootstrap data from Nexus API
   *
   * @param pubky - User's public key
   * @returns Bootstrap data (users, posts, streams)
   */
  static async fetch(pubky: Core.Pubky): Promise<Core.NexusBootstrapResponse | undefined> {
    const url = Core.bootstrapApi.get(pubky);
      let data = await Core.queryNexus<Core.NexusBootstrapResponse>(url);
      Libs.Logger.debug('Bootstrap data fetched successfully', { data });
      return data;
  }
}
