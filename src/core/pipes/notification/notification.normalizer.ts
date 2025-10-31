import { LastReadResult } from 'pubky-app-specs';
import * as Core from '@/core';

export class NotificationNormalizer {
  private constructor() {}

  static to(pubky: Core.Pubky): LastReadResult {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    return builder.createLastRead();
  }
}
