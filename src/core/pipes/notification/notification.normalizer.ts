import { LastReadResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { getBusinessKey } from '@/core/models/notification/notification.helpers';

export class NotificationNormalizer {
  private constructor() {}

  static to(pubky: Core.Pubky): LastReadResult {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createLastRead();
    Libs.Logger.debug('LastRead validated', { result });
    return result;
  }

  static toFlatNotification(nexusNotification: Core.NexusNotification): Core.FlatNotification {
    // First create the notification without id to generate business key
    const notificationWithoutId = {
      timestamp: nexusNotification.timestamp,
      ...nexusNotification.body,
    } as Core.FlatNotification;

    // Generate id from business key for natural deduplication
    const id = getBusinessKey(notificationWithoutId);

    return {
      ...notificationWithoutId,
      id,
    };
  }
}
