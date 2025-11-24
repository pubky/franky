import * as Core from '@/core';

export class UserController {
  private constructor() {} // Prevent instantiation

  /**
   * Get user details from local database
   * This is a read-only operation that queries the local cache
   */
  static async getDetails({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null | undefined> {
    return await Core.ProfileApplication.read({ userId });
  }

  /**
   * Get user counts from local database
   * This is a read-only operation that queries the local cache
   */
  static async getCounts({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserCounts | null> {
    const counts = await Core.UserApplication.counts({ userId });
    return counts ?? null;
  }

  static async follow(eventType: Core.HomeserverAction, { follower, followee }: Core.TFollowParams) {
    const { meta, follow } = Core.FollowNormalizer.to({ follower, followee });
    await Core.UserApplication.follow({
      eventType,
      followUrl: meta.url,
      followJson: follow.toJson(),
      follower,
      followee,
    });
  }

  static async mute(eventType: Core.HomeserverAction, { muter, mutee }: Core.TMuteParams) {
    const { meta, mute } = Core.MuteNormalizer.to({ muter, mutee });
    await Core.UserApplication.mute({
      eventType,
      muteUrl: meta.url,
      muteJson: mute.toJson(),
      muter,
      mutee,
    });
  }

  /**
   * Refreshes unread notifications for the current user.
   * @param userId - The user ID to fetch notifications for
   * @returns Promise resolving to the number of unread notifications
   */
  static async notifications({ userId }: Core.TReadProfileParams) {
    const notificationStore = Core.useNotificationStore.getState();
    const lastRead = notificationStore.selectLastRead();
    const unread = await Core.UserApplication.notifications({ userId, lastRead });
    notificationStore.setUnread(unread);
  }

  static async tags(params: Core.TUserTagsParams): Promise<Core.NexusTag[]> {
    return await Core.UserApplication.tags(params);
  }

  static async taggers(params: Core.TUserTaggersParams): Promise<Core.NexusUser[]> {
    return await Core.UserApplication.taggers(params);
  }
}
