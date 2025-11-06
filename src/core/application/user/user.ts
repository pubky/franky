import * as Core from '@/core';

export class UserApplication {
  /**
   * Handles following or unfollowing a user.
   * Performs local database operations and syncs with the homeserver.
   * @param params - Parameters containing event type, URLs, JSON data, and user IDs
   */
  static async follow({ eventType, followUrl, followJson, follower, followee }: Core.TUserApplicationFollowParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.LocalFollowService.create({ follower, followee });
    } else if (eventType === Core.HomeserverAction.DELETE) {
      await Core.LocalFollowService.delete({ follower, followee });
    }
    await Core.HomeserverService.request(eventType, followUrl, followJson);
  }

  /**
   * Handles muting or unmuting a user.
   * Performs local database operations and syncs with the homeserver.
   * @param params - Parameters containing event type, URLs, JSON data, and user IDs
   */
  static async mute({ eventType, muteUrl, muteJson, muter, mutee }: Core.TUserApplicationMuteParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.LocalMuteService.create({ muter, mutee });
      await Core.HomeserverService.request(eventType, muteUrl, muteJson);
      return;
    }

    if (eventType === Core.HomeserverAction.DELETE) {
      await Core.LocalMuteService.delete({ muter, mutee });
      await Core.HomeserverService.request(eventType, muteUrl, muteJson);
      return;
    }
  }

  /**
   * Retrieves notifications from the nexus service and persists them locally,
   * then returns the count of unread notifications.
   * @param params - Parameters containing user ID and last read timestamp
   * @returns Promise resolving to the number of unread notifications
   */
  static async notifications({ userId, lastRead }: Core.TUserApplicationNotificationsParams): Promise<number> {
    const notificationList = await Core.NexusUserService.notifications({ user_id: userId, end: lastRead });
    return await Core.LocalNotificationService.persitAndGetUnreadCount(notificationList, lastRead);
  }
}
