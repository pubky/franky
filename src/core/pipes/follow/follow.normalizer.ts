import { FollowResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class FollowNormalizer {
  private constructor() {}

  static to({ follower, followee }: Core.TFollowParams): FollowResult {
    const builder = Core.PubkySpecsSingleton.get(follower);
    const result = builder.createFollow(followee);
    Libs.Logger.debug('Follow validated', { result });
    return result;
  }
}
