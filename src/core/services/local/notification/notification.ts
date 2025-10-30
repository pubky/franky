import * as Core from '@/core';

export class LocalNotificationService {
  private constructor() {}

  /**
   * Persists notifications to indexed db and returns the count of unread notifications.
   * Transforms nexus notifications into flat notifications, counts those newer than lastRead,
   * and bulk saves them to the database.
   * @param notificationList - Array of notifications from the nexus service
   * @param lastRead - Timestamp of the last read notification
   * @returns Promise resolving to the number of unread notifications
   */
  static async persitAndGetUnreadCount(notificationList: Core.NexusNotification[], lastRead: number): Promise<number> {
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
