import { UserResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class UserNormalizer {
  private constructor() {}

  static to(user: Core.UserValidatorData, pubky: Core.Pubky): UserResult {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createUser(user.name, user.bio, user.image, user.links, user.status || undefined);
    Libs.Logger.debug('User validated', { result });
    return result;
  }
}
