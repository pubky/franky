import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus Search Service
 *
 * Handles search operations against the Nexus API
 */
export class NexusSearchService {
  private constructor() {}

  /**
   * Search users by ID prefix
   *
   * @param params - Parameters containing prefix and pagination options
   * @returns Array of user IDs matching the ID prefix
   */
  static async usersById(params: Core.TPrefixSearchParams): Promise<Core.TSearchResult> {
    const url = Core.searchApi.byUser(params);
    const response = await Core.queryNexus<Core.TSearchResult>(url);
    Libs.Logger.debug('Users by ID fetched successfully', { count: response?.length ?? 0 });
    return response || [];
  }

  /**
   * Search users by name prefix
   *
   * @param params - Parameters containing prefix and pagination options
   * @returns Array of user IDs matching the name prefix
   */
  static async usersByName(params: Core.TPrefixSearchParams): Promise<Core.TSearchResult> {
    const url = Core.searchApi.byUsername(params);
    const response = await Core.queryNexus<Core.TSearchResult>(url);
    Libs.Logger.debug('Users by name fetched successfully', { count: response?.length ?? 0 });
    return response || [];
  }

  /**
   * Search tags by prefix
   *
   * @param params - Parameters containing prefix and pagination options
   * @returns Array of tag labels matching the prefix
   */
  static async tags(params: Core.TPrefixSearchParams): Promise<Core.TSearchResult> {
    const url = Core.searchApi.byPrefix(params);
    const response = await Core.queryNexus<Core.TSearchResult>(url);
    Libs.Logger.debug('Tags fetched successfully', { count: response?.length ?? 0 });
    return response || [];
  }
}
