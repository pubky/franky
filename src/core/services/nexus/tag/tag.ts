import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus Tag Service
 *
 * Handles fetching tag data from Nexus API.
 */
export class NexusTagService {
  private constructor() {}

  /**
   * Search tags by prefix
   */
  static async search(params: Core.TPrefixSearchParams): Promise<string[]> {
    const url = Core.tagApi.search(params);
    const response = await Core.queryNexus<string[]>(url);
    Libs.Logger.debug('Tags fetched successfully', { count: response?.length ?? 0 });
    return response || [];
  }
}
