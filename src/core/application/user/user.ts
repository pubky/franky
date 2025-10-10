import * as Core from '@/core';
import type { TUserApplicationFollowParams } from './user.types';

export class UserApplication {
  static async follow({ eventType, followUrl, followJson, follower, followee }: TUserApplicationFollowParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.Local.Follow.create({ follower, followee });
    } else if (eventType === Core.HomeserverAction.DELETE) {
      await Core.Local.Follow.delete({ follower, followee });
    }
    await Core.HomeserverService.request(eventType, followUrl, followJson);
  }
}
