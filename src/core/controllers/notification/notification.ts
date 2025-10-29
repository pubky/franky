import * as Core from '@/core';

export class NotificationController {
  private constructor() {} // Prevent instantiation

  // This function should be called from a notification hook that polls at regular intervals
  // to check for new unread notifications and update the store
  static async checkUnread({ userId }: Core.TReadProfileParams) {
    const notificationStore = Core.useNotificationStore.getState();
    const lastRead = notificationStore.selectLastRead();
    const unread = await Core.NotificationApplication.checkUnread({ userId, lastRead });
    notificationStore.setUnread(unread);
  }

  // When we run the bootstrap process, we should poll for notifications and update the store
  static async poll({ userId }: Core.TReadProfileParams) {
    const notificationState = await Core.NotificationApplication.poll({
      userId
    });
    Core.useNotificationStore.getState().init(notificationState);
  }
}


