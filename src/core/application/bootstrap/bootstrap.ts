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
    const [data, { notificationList, lastRead }] = await Promise.all([
      Core.NexusBootstrapService.fetch(params.pubky),
      this.fetchNotifications(params),
    ]);
    if (!data) {
      // TODO: Maybe in the UI, we should redirect or show some special message to the user.
      throw Libs.createNexusError(Libs.NexusErrorType.NO_CONTENT, 'No content found for bootstrap data', 204);
    }
    const results = await Promise.all([
      Core.LocalStreamUsersService.persistUsers(data.users),
      Core.LocalStreamPostsService.persistPosts(data.posts),
      Core.LocalStreamPostsService.upsert({
        streamId: Core.PostStreamTypes.TIMELINE_ALL_ALL,
        stream: data.list.stream,
      }),
      Core.LocalStreamUsersService.upsert({
        streamId: Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
        stream: data.list.influencers,
      }),
      Core.LocalStreamUsersService.upsert({
        streamId: Core.UserStreamTypes.RECOMMENDED,
        stream: data.list.recommended,
      }),
      // Both features: hot tags and tag streams
      Core.LocalHotService.upsert(Core.buildHotTagsId(Core.UserStreamTimeframe.TODAY, 'all'), data.list.hot_tags),
      Core.LocalStreamTagsService.upsert(Core.TagStreamTypes.TODAY_ALL, data.list.hot_tags),
      Core.LocalNotificationService.persitAndGetUnreadCount(notificationList, lastRead),
    ]);

    const filesUris = results[1].postAttachments;
    const unread = results[results.length - 1] as number;

    return { notification: { unread, lastRead }, filesUris };
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
   * Performs application bootstrap with retry logic.
   * Retries bootstrap up to 3 times with 5-second delays to allow Nexus time to index new users.
   *
   * @param params - Bootstrap parameters
   * @param params.pubky - The user's public key identifier
   * @param params.lastReadUrl - URL to fetch user's last read timestamp from homeserver
   * @returns Promise resolving to notification state after successful bootstrap
   */
  static async initializeWithRetry(params: Core.TBootstrapParams): Promise<Core.TBootstrapResponse> {
    let success = false;
    let retries = 0;
    let notificationState: Core.TBootstrapResponse = { notification: Core.notificationInitialState, filesUris: [] };
    while (!success && retries < 3) {
      try {
        // Wait 5 seconds before each attempt to let Nexus index the user
        Libs.Logger.info(`Waiting 5 seconds before bootstrap attempt ${retries + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        notificationState = await this.initialize(params);
        success = true;
      } catch (error) {
        Libs.Logger.error('Failed to bootstrap', error, retries);
        retries++;
      }
    }
    if (!success) {
      throw new Error('User still not indexed');
    }
    return notificationState;
  }
}
