import { SearchApplication } from '@/core/application/search';
import {
  type NexusHotTag,
  type NexusUser,
  type NexusPostsKeyStream,
  type TPrefixSearchParams,
  type TTagSearchParams,
  type TTagHotParams,
} from '@/core/services/nexus';
import * as Libs from '@/libs';
import type { TSearchUserResult } from './search.types';

export class SearchController {
  private constructor() {}

  /**
   * Get hot/trending tags
   */
  static async getHotTags(params: TTagHotParams): Promise<NexusHotTag[]> {
    return await SearchApplication.hotTags(params);
  }

  /**
   * Search users by ID prefix (pubky)
   */
  static async getUsersById(params: TPrefixSearchParams): Promise<TSearchUserResult[]> {
    const users = await SearchApplication.usersById(params);
    return users.map((user) => SearchController.mapNexusUserToSearchResult(user));
  }

  /**
   * Search users by name prefix
   */
  static async getUsersByName(params: TPrefixSearchParams): Promise<TSearchUserResult[]> {
    const users = await SearchApplication.usersByName(params);
    return users.map((user) => SearchController.mapNexusUserToSearchResult(user));
  }

  /**
   * Search tags by prefix
   */
  static async getTags(params: TPrefixSearchParams): Promise<string[]> {
    return await SearchApplication.tags(params);
  }

  /**
   * Search posts by tag
   */
  static async getPosts(params: TTagSearchParams): Promise<NexusPostsKeyStream> {
    return await SearchApplication.posts(params);
  }

  /**
   * Map NexusUser to presentation-layer search result format
   */
  private static mapNexusUserToSearchResult(user: NexusUser): TSearchUserResult {
    return {
      id: user.details.id,
      name: user.details.name,
      handle: Libs.formatPublicKey({ key: user.details.id, length: 12 }),
      avatar: user.details.image ?? undefined,
      tagsCount: user.counts?.unique_tags,
      postsCount: user.counts?.posts,
    };
  }
}
