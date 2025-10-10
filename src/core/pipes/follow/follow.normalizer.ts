import { FollowResult } from 'pubky-app-specs';
import * as Core from '@/core';

export class FollowNormalizer {
  private constructor() {}

  static async to({ follower, followee }: Core.TFollowParams): Promise<FollowResult> {
    const builder = Core.PubkySpecsSingleton.get(follower);
    return builder.createFollow(followee);
  }
}
