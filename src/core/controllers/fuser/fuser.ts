import { TFollowParams } from './fuser.type';
import * as Core from '@/core';

export class FUserController {
  private constructor() {} // Prevent instantiation

  static async follow({ follower, followee }: TFollowParams) {
    const { meta, follow } = await Core.FollowNormalizer.to({ follower, followee });
    await Core.UserApplication.follow({
      eventType: Core.HomeserverAction.PUT,
      followUrl: meta.url,
      followJson: follow.toJson(),
      follower,
      followee,
    });
  }
}
