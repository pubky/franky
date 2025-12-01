import * as Core from '@/core';
import * as Config from '@/config';
import * as Libs from '@/libs';

export class NotificationController {
  private constructor() {} // Prevent instantiation

  /**
   * Refreshes unread notifications for the current user.
   * @param userId - The user ID to fetch notifications for
   * @returns Promise resolving when notifications are updated
   */
  static async notifications({ userId }: Core.TReadProfileParams) {
    const notificationStore = Core.useNotificationStore.getState();
    const lastRead = notificationStore.selectLastRead();
    const unread = await Core.NotificationApplication.notifications({ userId, lastRead });
    notificationStore.setUnread(unread);
  }

  /**
   * Marks all notifications as read by updating the lastRead timestamp on the homeserver.
   * This resets the unread count to 0 and updates the local store.
   * Should be called when the user enters the notifications page.
   */
  static markAllAsRead() {
    const pubky = Core.useAuthStore.getState().selectCurrentUserPubky();

    if (!pubky) {
      Libs.Logger.warn('Cannot mark notifications as read: no authenticated user');
      return;
    }

    // Delegate to application layer (handles homeserver sync)
    const timestamp = Core.NotificationApplication.markAllAsRead(pubky);

    // Update local store
    const notificationStore = Core.useNotificationStore.getState();
    notificationStore.setLastRead(timestamp);
    notificationStore.setUnread(0);
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

  /**
   * Retrieves all notifications from the local database.
   * Used for reactive queries in UI components.
   *
   * @returns Promise resolving to all notifications ordered by timestamp descending
   */
  static async getAllFromCache(): Promise<Core.FlatNotification[]> {
    return await Core.NotificationApplication.getAllFromCache();
  }
}
