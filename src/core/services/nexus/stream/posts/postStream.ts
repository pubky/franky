import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus Post Stream Service
 *
 * Handles fetching post stream data from Nexus API.
 */
export class NexusPostStreamService {
  /**
   * Fetches post stream data from Nexus API
   *
   * @param params - Parameters for fetching post stream data
   * @returns Post stream data
   */
  static async fetch(params: Core.TStreamPostsParams): Promise<Core.NexusPost[]> {
    try {
      const url = Core.postStreamApi.all(params);
      const response = await Core.queryNexus<Core.NexusPost[]>(url);
      Libs.Logger.debug('Posts fetched successfully', { response });

      return response;
    } catch (error) {
      Libs.Logger.error('Failed to fetch posts', error);
      throw error;
    }
  }
}
