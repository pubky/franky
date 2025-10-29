import * as Libs from '@/libs';
import * as Core from '@/core';

export class BootstrapApplication {
  private constructor() { }

  /**
   * Reads bootstrap data from Nexus API and polls for user notifications in parallel.
   * This method fetches all necessary data to initialize the user's application state,
   * including users, posts, streams, and notification counts.
   *
   * @param pubky - The user's public key identifier
   * @returns Promise resolving to the current notification state with unread count and last read timestamp
   */
  static async read(pubky: Core.Pubky): Promise<Core.NotificationState> {
    const [data, { notificationList, lastRead }] = await Promise.all([Core.NexusBootstrapService.fetch(pubky), this.pollNotifications(pubky)]);
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
   * Polls for the user's recent notifications and retrieves their last read timestamp.
   * This method fetches notification data from Nexus and determines which notifications
   * are unread based on the user's last read timestamp from the homeserver.
   *
   * @private
   * @param pubky - The user's public key identifier
   * @returns Promise resolving to notification data and last read timestamp
   */
  private static async pollNotifications(pubky: Core.Pubky) {
    const { timestamp: userLastRead } = await Core.HomeserverService.request<{ timestamp: number }>(Core.HomeserverAction.GET, Core.homeserverUrl.lastRead(pubky));
    const notificationList = await Core.NexusUserService.notifications({ user_id: pubky, limit: 30 });
    return { notificationList, lastRead: userLastRead };
  }

  /**
   * Authorizes a user and performs bootstrap with retry logic.
   * This method handles the initial user authorization and data synchronization process.
   * It includes automatic retry logic (up to 3 attempts) with delays to allow Nexus
   * indexing time for new users.
   *
   * @param pubky - The user's public key identifier
   * @returns Promise resolving to the notification state after successful bootstrap
   * @throws Error when bootstrap fails after all retry attempts
   */
  static async authorizeAndBootstrap(pubky: Core.Pubky): Promise<Core.NotificationState> {
    let success = false;
    let retries = 0;
    let notificationState = Core.notificationInitialState;
    while (!success && retries < 3) {
      try {
        // Wait 5 seconds before each attempt to let Nexus index the user
        Libs.Logger.info(`Waiting 5 seconds before bootstrap attempt ${retries + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        notificationState = await this.read(pubky);
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
