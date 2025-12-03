import {
  NexusSearchService,
  NexusHotService,
  type NexusHotTag,
  type NexusUser,
  type NexusPostsKeyStream,
} from '@/core/services/nexus';
import type { THotTagsParams, TSearchUsersParams, TSearchTagsParams, TSearchPostsParams } from './search.types';

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
  static async hotTags(params: THotTagsParams): Promise<NexusHotTag[]> {
    return await NexusHotService.fetch(params);
  }

  /**
   * Search users by ID prefix (pubky)
   */
  static async usersById(params: TSearchUsersParams): Promise<NexusUser[]> {
    return await NexusSearchService.usersById(params);
  }

  /**
   * Search users by name prefix
   */
  static async usersByName(params: TSearchUsersParams): Promise<NexusUser[]> {
    return await NexusSearchService.usersByName(params);
  }

  /**
   * Search tags by prefix
   */
  static async tags(params: TSearchTagsParams): Promise<string[]> {
    return await NexusSearchService.tags(params);
  }

  /**
   * Search posts by tag
   */
  static async posts(params: TSearchPostsParams): Promise<NexusPostsKeyStream> {
    return await NexusSearchService.posts(params);
  }
}
