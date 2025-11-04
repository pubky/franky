import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Config from '@/config';

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
  static async fetch(params: Core.TReadStreamPostsParams): Promise<Core.NexusPost[]> {
    try {
      const url = Core.postStreamApi.all(params);
      let response = await Core.queryNexus<Core.NexusPost[]>(url);
      if (!response) response = [];
      Libs.Logger.debug('Posts fetched successfully', { response });
      return response;
    } catch (error) {
      Libs.Logger.error('Failed to fetch posts', error);
      throw error;
    }
  }
}
