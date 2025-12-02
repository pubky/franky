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
  static async persistAndGetUnreadCount(notificationList: Core.NexusNotification[], lastRead: number): Promise<number> {
    let unreadCount = 0;

    const flatNotifications: Core.FlatNotification[] = notificationList.map((notification) => {
      const flatNotification = Core.NotificationNormalizer.toFlatNotification(notification);

      if (flatNotification.timestamp > lastRead) {
        unreadCount++;
      }

      return flatNotification;
    });

    await Core.NotificationModel.bulkSave(flatNotifications);
    return unreadCount;
  }

  static async getOlderThan(olderThan: number, limit: number): Promise<Core.FlatNotification[]> {
    return await Core.NotificationModel.getOlderThan(olderThan, limit);
  }

  /**
   * Retrieves all notifications from the local database ordered by timestamp descending.
   * @returns Promise resolving to array of all notifications
   */
  static async getAll(): Promise<Core.FlatNotification[]> {
    return await Core.NotificationModel.getAll();
  }

  /**
   * Persists flat notifications to the local database.
   * @param notifications - Array of flat notifications to save
   */
  static async bulkSave(notifications: Core.FlatNotification[]): Promise<void> {
    await Core.NotificationModel.bulkSave(notifications);
  }
}
