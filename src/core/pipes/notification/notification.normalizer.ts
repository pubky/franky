import { LastReadResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class NotificationNormalizer {
  private constructor() {}

  static to(pubky: Core.Pubky): LastReadResult {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createLastRead();
    Libs.Logger.debug('LastRead validated', { result });
    return result;
  }
}
