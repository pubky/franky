import * as Core from '@/core';

export class NotificationApplication {
  private constructor() {} // Prevent instantiation

  static async checkUnread({ userId, lastRead }: Core.TNotificationApplicationParams): Promise<number> {
    const url = Core.userApi.notifications({ user_id: userId, end: lastRead });
    const notificationList = await Core.queryNexus<Core.NexusNotification[]>(url);
    return await Core.LocalNotificationService.persitAndGetUnreadCount(notificationList, lastRead);
  }
}


