import { UserResult } from 'pubky-app-specs';
import * as Core from '@/core';

export class UserNormalizer {
  private constructor() {}

  static async to(user: Core.UserValidatorData, pubky: Core.Pubky): Promise<UserResult> {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    return builder.createUser(user.name, user.bio, user.image, user.links);
  }
}
