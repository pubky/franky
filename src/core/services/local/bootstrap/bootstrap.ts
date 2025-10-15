import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalBootstrapService {
  private constructor() {}

  static async persistBootstrap(data: Core.NexusBootstrapResponse): Promise<void> {
    try {
      await Promise.all([
        Core.LocalStreamUsersService.persistUsers(data.users),
        Core.LocalStreamPostsService.persistPosts(data.posts),
        Core.LocalBootstrapService.persistStreams(data.list),
      ]);

      Libs.Logger.debug('Bootstrap data persisted successfully', {
        users: data.users.length,
        posts: data.posts.length,
        streams: {
          timeline: data.list.stream.length,
          influencers: data.list.influencers.length,
          recommended: data.list.recommended.length,
          hotTags: data.list.hot_tags.length,
        },
      });
    } catch (error) {
      Libs.Logger.error('Failed to persist bootstrap data', { error });
      throw error;
    }
  }

  /**
   * Persists stream data to local cache
   *
   * Stores different types of streams:
   * - Post streams (timeline)
   * - User streams (influencers, recommended)
   * - Tag streams (hot tags)
   *
   * @param list - Stream lists from Nexus API
   */
  static async persistStreams(list: Core.NexusBootstrapList): Promise<void> {
    try {
      await Promise.all([
        Core.PostStreamModel.upsert(Core.PostStreamTypes.TIMELINE_ALL, list.stream),
        Core.UserStreamModel.upsert(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL, list.influencers),
        Core.UserStreamModel.upsert(Core.UserStreamTypes.RECOMMENDED, list.recommended),
        Core.TagStreamModel.upsert(Core.TagStreamTypes.TODAY_ALL, list.hot_tags),
      ]);

      Libs.Logger.debug('Streams persisted successfully', {
        posts: list.stream.length,
        influencers: list.influencers.length,
        recommended: list.recommended.length,
        hotTags: list.hot_tags.length,
      });
    } catch (error) {
      Libs.Logger.error('Failed to persist streams', { error });
      throw error;
    }
  }
}
