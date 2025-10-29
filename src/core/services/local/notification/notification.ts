import * as Core from '@/core';

export class LocalNotificationService {
    private constructor() { }

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