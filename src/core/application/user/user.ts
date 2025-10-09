import * as Core from '@/core';
import type { TUserApplicationFollowParams } from './user.types';

export class UserApplication {
  static async follow({ eventType, followUrl, followJson, follower, followee }: TUserApplicationFollowParams) {
    await Core.Local.Follow.create({ follower, followee });
    await Core.HomeserverService.request(eventType, followUrl, followJson);
  }
}
