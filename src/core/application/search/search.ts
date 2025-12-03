import {
  NexusSearchService,
  NexusHotService,
  type NexusHotTag,
  type NexusUser,
  type NexusPostsKeyStream,
  type TPrefixSearchParams,
  type TTagSearchParams,
  type TTagHotParams,
} from '@/core/services/nexus';

/**
 * Search Application Layer
 *
 * Orchestrates search operations between controllers and services.
 */
export class SearchApplication {
  private constructor() {}

  /**
   * Get hot/trending tags
   */
  static async hotTags(params: TTagHotParams): Promise<NexusHotTag[]> {
    return await NexusHotService.fetch(params);
  }

  /**
   * Search users by ID prefix (pubky)
   */
  static async usersById(params: TPrefixSearchParams): Promise<NexusUser[]> {
    return await NexusSearchService.usersById(params);
  }

  /**
   * Search users by name prefix
   */
  static async usersByName(params: TPrefixSearchParams): Promise<NexusUser[]> {
    return await NexusSearchService.usersByName(params);
  }

  /**
   * Search tags by prefix
   */
  static async tags(params: TPrefixSearchParams): Promise<string[]> {
    return await NexusSearchService.tags(params);
  }

  /**
   * Search posts by tag
   */
  static async posts(params: TTagSearchParams): Promise<NexusPostsKeyStream> {
    return await NexusSearchService.posts(params);
  }
}
