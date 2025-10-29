import * as Core from '@/core';

export class NotificationApplication {
  static async checkUnread({ userId, lastRead }: Core.TNotificationApplicationParams): Promise<number> {
    const url = Core.userApi.notifications({ user_id: userId, end: lastRead });
    const notificationList = await Core.queryNexus<Core.NexusNotification[]>(url);
    return await this.persitAndGetUnreadCount(notificationList, lastRead);
  }

  static async poll({ userId }: Core.TReadProfileParams): Promise<Core.NotificationState> {
    const { timestamp: userLastRead } = await Core.HomeserverService.request<{ timestamp: number }>(Core.HomeserverAction.GET, Core.homeserverUrl.lastRead(userId));
    const url = Core.userApi.notifications({ user_id: userId, limit: 30 });
    const notificationList = await Core.queryNexus<Core.NexusNotification[]>(url);
    const unreadCount = await this.persitAndGetUnreadCount(notificationList, userLastRead);
    return { lastRead: userLastRead, unread: unreadCount };
  }

  private static async persitAndGetUnreadCount(notificationList: Core.NexusNotification[], lastRead: number): Promise<number> {
    let unreadCount = 0;

    const flatNotifications: Core.FlatNotification[] = notificationList.map((notification) => {
      const flatNotification = {
        timestamp: notification.timestamp,
        ...notification.body,
      } as Core.FlatNotification;

      if (flatNotification.timestamp > lastRead) {
        unreadCount++;
      }

      return flatNotification;
    });

    await Core.NotificationModel.bulkSave(flatNotifications);
    return unreadCount;
  }
}


