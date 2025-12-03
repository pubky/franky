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
   * @returns Array of users matching the ID prefix
   */
  static async usersById(params: Core.TPrefixSearchParams): Promise<Core.NexusUser[]> {
    const url = Core.searchApi.byUser(params);
    const response = await Core.queryNexus<Core.NexusUser[]>(url);
    Libs.Logger.debug('Users by ID fetched successfully', { count: response?.length ?? 0 });
    return response || [];
  }

  /**
   * Search users by name prefix
   *
   * @param params - Parameters containing prefix and pagination options
   * @returns Array of users matching the name prefix
   */
  static async usersByName(params: Core.TPrefixSearchParams): Promise<Core.NexusUser[]> {
    const url = Core.searchApi.byUsername(params);
    const response = await Core.queryNexus<Core.NexusUser[]>(url);
    Libs.Logger.debug('Users by name fetched successfully', { count: response?.length ?? 0 });
    return response || [];
  }

  /**
   * Search tags by prefix
   *
   * @param params - Parameters containing prefix and pagination options
   * @returns Array of tag labels matching the prefix
   */
  static async tags(params: Core.TPrefixSearchParams): Promise<string[]> {
    const url = Core.searchApi.byPrefix(params);
    const response = await Core.queryNexus<string[]>(url);
    Libs.Logger.debug('Tags fetched successfully', { count: response?.length ?? 0 });
    return response || [];
  }

  /**
   * Search posts by tag
   *
   * @param params - Parameters containing tag and pagination options
   * @returns Post keys stream matching the tag
   */
  static async posts(params: Core.TTagSearchParams): Promise<Core.NexusPostsKeyStream> {
    const url = Core.searchApi.byTag(params);
    const response = await Core.queryNexus<Core.NexusPostsKeyStream>(url);
    Libs.Logger.debug('Posts fetched successfully', { count: response?.post_keys?.length ?? 0 });
    return response || { post_keys: [], last_post_score: 0 };
  }
}
