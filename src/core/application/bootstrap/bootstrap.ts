import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Config from '@/config';

export class BootstrapApplication {
  private constructor() {}

  /**
   * Initialize application state from Nexus and notifications in parallel.
   *
   * @param params - Bootstrap parameters
   * @param params.pubky - The user's public key identifier
   * @param params.lastReadUrl - URL to fetch user's last read timestamp from homeserver
   * @returns Promise resolving to notification state with unread count and last read timestamp
   */
  static async initialize(params: Core.TBootstrapParams): Promise<Core.TBootstrapResponse> {
    const [data, { notificationList, lastRead }, mutedUserIds] = await Promise.all([
      Core.NexusBootstrapService.fetch(params.pubky),
      this.fetchNotifications(params),
      this.fetchMutedUsers(params.pubky),
    ]);
    // TODO: With the new Nexus API, data is never undefined
    if (!data) {
      throw Libs.createNexusError(Libs.NexusErrorType.NO_CONTENT, 'No content found for bootstrap data', 204);
    }
    if (!data.indexed) {
      Libs.Logger.error('User is not indexed in Nexus. Adding user to TTL', { pubky: params.pubky });
    }
    const mutedStreamId = Core.buildUserCompositeId({
      userId: params.pubky,
      reach: Core.UserStreamSource.MUTED,
    });
    const results = await Promise.all([
      Core.LocalStreamUsersService.persistUsers(data.users),
      Core.LocalStreamPostsService.persistPosts({ posts: data.posts }),
      Core.LocalStreamPostsService.upsert({
        streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
        stream: data.ids.stream,
      }),
      Core.LocalStreamUsersService.upsert({
        streamId: Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
        stream: data.ids.influencers,
      }),
      Core.LocalStreamUsersService.upsert({
        streamId: Core.UserStreamTypes.RECOMMENDED,
        stream: data.ids.recommended,
      }),
      Core.LocalStreamUsersService.upsert({
        streamId: mutedStreamId,
        stream: mutedUserIds,
      }),
      // Both features: hot tags and tag streams
      Core.LocalHotService.upsert(Core.buildHotTagsId(Core.UserStreamTimeframe.TODAY, 'all'), data.ids.hot_tags),
      Core.LocalStreamTagsService.upsert(Core.TagStreamTypes.TODAY_ALL, data.ids.hot_tags),
      Core.LocalNotificationService.persistAndGetUnreadCount(notificationList, lastRead),
    ]);

    // TODO: That data in the future will should come from the bootstrap data and we will persist directly in the Promise.all call
    await Core.FileApplication.persistFiles(results[1].postAttachments);
    const unread = results[results.length - 1] as number;

    return { notification: { unread, lastRead } };
  }

  /**
   * Retrieves user's last read timestamp from homeserver and fetches notification data from Nexus and .
   * Used internally by initialize() to get notification state.
   *
   * @private
   * @param params - Bootstrap parameters
   * @param params.pubky - The user's public key identifier
   * @param params.lastReadUrl - URL to fetch user's last read timestamp from homeserver
   * @returns Promise resolving to notification list and last read timestamp
   */
  private static async fetchNotifications({ pubky, lastReadUrl }: Core.TBootstrapParams) {
    let userLastRead: number;
    try {
      const { timestamp } = await Core.HomeserverService.request<{ timestamp: number }>(
        Core.HomeserverAction.GET,
        lastReadUrl,
      );
      userLastRead = timestamp;
    } catch (error) {
      // Only handle 404 errors (resource not found) - rethrow everything else
      if (error instanceof Libs.AppError && error.statusCode === 404) {
        Libs.Logger.info('Last read file not found, creating new one', { pubky });
        const lastRead = Core.LastReadNormalizer.to(pubky);
        void Core.HomeserverService.request(Core.HomeserverAction.PUT, lastRead.meta.url, lastRead.last_read.toJson());
        userLastRead = Number(lastRead.last_read.timestamp);
      } else {
        // Network errors, timeouts, server errors, etc. should bubble up
        Libs.Logger.error('Failed to fetch last read timestamp', error);
        throw error;
      }
    }

    const notificationList = await Core.NexusUserService.notifications({
      user_id: pubky,
      limit: Config.NEXUS_NOTIFICATIONS_LIMIT,
    });
    return { notificationList, lastRead: userLastRead };
  }

  /**
   * Fetches user's muted users list from Nexus.
   *
   * @private
   * @param pubky - The user's public key identifier
   * @returns Promise resolving to array of muted user IDs
   */
  private static async fetchMutedUsers(pubky: Core.Pubky): Promise<Core.Pubky[]> {
    const streamId = Core.buildUserCompositeId({
      userId: pubky,
      reach: Core.UserStreamSource.MUTED,
    });
    // Omit limit to fetch all muted users
    return Core.NexusUserStreamService.fetch({ streamId, params: {} });
  }
}
