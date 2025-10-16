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

  static async downloadData({ pubky, setProgress }: Core.TDownloadDataInput) {
    await Core.UserApplication.downloadData({ pubky, setProgress });
  }
}
