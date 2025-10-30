import * as Core from '@/core';

export class UserController {
  private constructor() {} // Prevent instantiation

  static async follow(eventType: Core.HomeserverAction, { follower, followee }: Core.TFollowParams) {
    const { meta, follow } = await Core.FollowNormalizer.to({ follower, followee });
    await Core.UserApplication.follow({
      eventType,
      followUrl: meta.url,
      followJson: follow.toJson(),
      follower,
      followee,
    });
  }

  static async mute(eventType: Core.HomeserverAction, { muter, mutee }: Core.TMuteParams) {
    const { meta, mute } = await Core.MuteNormalizer.to({ muter, mutee });
    await Core.UserApplication.mute({
      eventType,
      muteUrl: meta.url,
      muteJson: mute.toJson(),
      muter,
      mutee,
    });
  }
  
  // This function should be called from a notification hook that polls at regular intervals
  // to check for new unread notifications and update the store
  static async notifications({ userId }: Core.TReadProfileParams) {
    const notificationStore = Core.useNotificationStore.getState();
    const lastRead = notificationStore.selectLastRead();
    const unread = await Core.UserApplication.pollNotifications({ userId, lastRead });
    notificationStore.setUnread(unread);
  }
}
