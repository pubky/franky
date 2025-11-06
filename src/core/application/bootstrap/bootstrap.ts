import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Config from '@/config';

export class BootstrapApplication {
  private constructor() {}

  /**
   * Initialize application state from Nexus and notifications in parallel.
   * Fetches data, persists users/posts/streams locally, computes unread notifications,
   * and returns the composed NotificationState.
   *
   * @param pubky - The user's public key identifier
   * @returns Promise resolving to the current notification state with unread count and last read timestamp
   */
  static async initialize(params: Core.TBootstrapParams): Promise<Core.NotificationState> {
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
      Core.LocalStreamPostsService.upsert(Core.PostStreamTypes.TIMELINE_ALL, data.list.stream),
      Core.LocalStreamUsersService.upsert(Core.UserStreamTypes.TODAY_INFLUENCERS_ALL, data.list.influencers),
      Core.LocalStreamUsersService.upsert(Core.UserStreamTypes.RECOMMENDED, data.list.recommended),
      Core.LocalStreamTagsService.upsert(Core.TagStreamTypes.TODAY_ALL, data.list.hot_tags),
      Core.LocalNotificationService.persitAndGetUnreadCount(notificationList, lastRead),
    ]);

    return { unread: results[results.length - 1] as number, lastRead };
  }

  /**
   * Fetches the head of the notification data from Nexus and determines which notifications
   * are unread based on the user's last read timestamp from the homeserver.
   *
   * @private
   * @param pubky - The user's public key identifier
   * @returns Promise resolving to notification data and last read timestamp
   */
  private static async fetchNotifications({ pubky, lastReadUrl }: Core.TBootstrapParams) {
    const { timestamp: userLastRead } = await Core.HomeserverService.request<{ timestamp: number }>(
      Core.HomeserverAction.GET,
      lastReadUrl,
    );
    const notificationList = await Core.NexusUserService.notifications({
      user_id: pubky,
      limit: Config.NEXUS_NOTIFICATIONS_LIMIT,
    });
    return { notificationList, lastRead: userLastRead };
  }

  /**
   * Performs application bootstrap with retry logic.
   * This method handles initial data synchronization and will retry the bootstrap
   * (up to 3 attempts) with 5-second delays to allow Nexus indexing time for new users.
   *
   * @param pubky - The user's public key identifier
   * @returns Promise resolving to the notification state after successful bootstrap
   * @throws Error when bootstrap fails after all retry attempts
   */
  static async initializeWithRetry(params: Core.TBootstrapParams): Promise<Core.NotificationState> {
    let success = false;
    let retries = 0;
    let notificationState = Core.notificationInitialState;
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
