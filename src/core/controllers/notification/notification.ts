import * as Core from '@/core';
import * as Config from '@/config';

export class NotificationController {
  private constructor() {} // Prevent instantiation

  /**
   * Refreshes unread notifications for the current user.
   * @param userId - The user ID to fetch notifications for
   * @returns Promise resolving to the number of unread notifications
   */
  static async notifications({ userId }: Core.TReadProfileParams) {
    const notificationStore = Core.useNotificationStore.getState();
    const lastRead = notificationStore.selectLastRead();
    const unread = await Core.NotificationApplication.notifications({ userId, lastRead });
    notificationStore.setUnread(unread);
  }

  /**
   * Retrieves notifications from cache if available, otherwise fetches from Nexus.
   * Uses timestamp-based pagination.
   *
   * @param params.olderThan - Unix timestamp to get notifications older than.
   *                           Defaults to Infinity for initial load (most recent notifications).
   *                           Use the timestamp of the last notification for pagination.
   * @param params.limit - Maximum number of notifications to return. Defaults to NEXUS_NOTIFICATIONS_LIMIT.
   *
   * @returns Promise resolving to notifications and next timestamp for pagination
   */
  static async getOrFetchNotifications({
    olderThan = Infinity,
    limit = Config.NEXUS_NOTIFICATIONS_LIMIT,
  }: Core.TGetNotificationsParams): Promise<Core.TGetOrFetchNotificationsResponse> {
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();

    return await Core.NotificationApplication.getOrFetchNotifications({
      userId,
      olderThan,
      limit,
    });
  }
}

