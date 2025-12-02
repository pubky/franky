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

  static toFlatNotification(nexusNotification: Core.NexusNotification): Core.FlatNotification {
    // Create base notification without id
    const base = {
      timestamp: nexusNotification.timestamp,
      ...nexusNotification.body,
    } as Omit<Core.FlatNotification, 'id'>;

    // Generate unique id from notification content
    const id = Core.getNotificationKey(base as Core.FlatNotification);

    return { ...base, id } as Core.FlatNotification;
  }
}
