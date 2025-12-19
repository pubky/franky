import * as Core from '@/core';

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
    // TODO: Handle the error in application layer
    const url = Core.searchApi.byUser(params);
    return await Core.queryNexus<Core.TSearchResult>(url);
  }

  /**
   * Search users by name prefix
   *
   * @param params - Parameters containing prefix and pagination options
   * @returns Array of user IDs matching the name prefix
   */
  static async usersByName(params: Core.TPrefixSearchParams): Promise<Core.TSearchResult> {
    // TODO: Handle the error in application layer
    const url = Core.searchApi.byUsername(params);
    return await Core.queryNexus<Core.TSearchResult>(url);
  }

  /**
   * Search tags by prefix
   *
   * @param params - Parameters containing prefix and pagination options
   * @returns Array of tag labels matching the prefix
   */
  static async tags(params: Core.TPrefixSearchParams): Promise<Core.TSearchResult> {
    // TODO: Handle the error in application layer
    const url = Core.searchApi.byPrefix(params);
    return await Core.queryNexus<Core.TSearchResult>(url);
  }
}
