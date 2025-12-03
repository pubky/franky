import {
  SearchApplication,
  type THotTagsParams,
  type TSearchUsersParams,
  type TSearchTagsParams,
  type TSearchPostsParams,
} from '@/core/application/search';
import { type NexusHotTag, type NexusUser, type NexusPostsKeyStream } from '@/core/services/nexus';
import * as Libs from '@/libs';
import type { TSearchUserResult } from './search.types';

export class SearchController {
  private constructor() {}

  /**
   * Get hot/trending tags
   */
  static async getHotTags(params: THotTagsParams): Promise<NexusHotTag[]> {
    return await SearchApplication.hotTags(params);
  }

  /**
   * Search users by ID prefix (pubky)
   */
  static async getUsersById(params: TSearchUsersParams): Promise<TSearchUserResult[]> {
    const users = await SearchApplication.usersById(params);
    return users.map((user) => SearchController.mapNexusUserToSearchResult(user));
  }

  /**
   * Search users by name prefix
   */
  static async getUsersByName(params: TSearchUsersParams): Promise<TSearchUserResult[]> {
    const users = await SearchApplication.usersByName(params);
    return users.map((user) => SearchController.mapNexusUserToSearchResult(user));
  }

  /**
   * Search tags by prefix
   */
  static async getTags(params: TSearchTagsParams): Promise<string[]> {
    return await SearchApplication.tags(params);
  }

  /**
   * Search posts by tag
   */
  static async getPosts(params: TSearchPostsParams): Promise<NexusPostsKeyStream> {
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
