import { NexusSearchService, type TPrefixSearchParams } from '@/core/services/nexus';

/**
 * Search Application Layer
 *
 * Orchestrates search operations between controllers and services.
 */
export class SearchApplication {
  private constructor() {}

  /**
   * Search users by ID prefix (pubky)
   * @returns Array of user IDs (pubkeys) matching the search prefix
   */
  static async usersById(params: TPrefixSearchParams): Promise<string[]> {
    return await NexusSearchService.usersById(params);
  }

  /**
   * Search users by name prefix
   * @returns Array of user IDs (pubkeys) matching the search prefix
   */
  static async usersByName(params: TPrefixSearchParams): Promise<string[]> {
    return await NexusSearchService.usersByName(params);
  }

  /**
   * Search tags by prefix
   */
  static async tagsByPrefix(params: TPrefixSearchParams): Promise<string[]> {
    return await NexusSearchService.tags(params);
  }
}
