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
  static async read(params: Core.TStreamPostsParams): Promise<Core.NexusPost[]> {
    try {
      // Convert offset to skip for Nexus API
      const { offset, ...rest } = params;
      const apiParams = {
        ...rest,
        skip: offset, // Nexus API uses 'skip' instead of 'offset'
      };
      const url = Core.postStreamApi.all(apiParams);
      const response = await Core.queryNexus<Core.NexusPost[]>(url);
      Libs.Logger.debug('Posts fetched successfully', { response });

      return response;
    } catch (error) {
      Libs.Logger.error('Failed to fetch posts', error);
      throw error;
    }
  }
}
