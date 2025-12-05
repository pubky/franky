import { SearchApplication } from '@/core/application/search';
import { type TPrefixSearchParams, type TSearchResult } from '@/core/services/nexus';

export class SearchController {
  private constructor() {}

  /**
   * Search users by ID prefix (pubky)
   * @returns Array of user IDs (pubkeys) matching the search prefix
   */
  static async getUsersById(params: TPrefixSearchParams): Promise<TSearchResult> {
    return await SearchApplication.usersById(params);
  }

  /**
   * Search users by name prefix
   * @returns Array of user IDs (pubkeys) matching the search prefix
   */
  static async getUsersByName(params: TPrefixSearchParams): Promise<TSearchResult> {
    return await SearchApplication.usersByName(params);
  }

  /**
   * Search tags by prefix
   */
  static async getTagsByPrefix(params: TPrefixSearchParams): Promise<TSearchResult> {
    return await SearchApplication.tagsByPrefix(params);
  }
}
