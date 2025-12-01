import * as Core from '@/core';

export type TNotificationApplicationNotificationsParams = {
  userId: Core.Pubky;
  lastRead: number;
};

/**
 * Parameters for timestamp-based notification pagination.
 *
 * @property userId - The user ID to fetch notifications for
 * @property olderThan - Unix timestamp to get notifications older than.
 *                       Use Infinity for initial load (most recent notifications).
 *                       Use the timestamp of the last notification for pagination.
 * @property limit - Maximum number of notifications to return
 */
export type TGetOrFetchNotificationsParams = {
  userId: Core.Pubky;
  olderThan: number;
  limit: number;
};

/**
 * Response from getOrFetchNotifications containing notifications and pagination info.
 *
 * @property notifications - Array of notifications ordered by timestamp descending
 * @property olderThan - Timestamp to use for next page, undefined if no more results
 */
export type TGetOrFetchNotificationsResponse = {
  notifications: Core.FlatNotification[];
  olderThan: number | undefined;
};
