import type { NotificationType } from '@/core/models/notification/notification.types';

/**
 * Parameters for timestamp-based notification pagination in controller.
 *
 * @property types - Optional array of notification types to filter by. If null/undefined, returns all types.
 * @property olderThan - Unix timestamp to get notifications older than.
 *                       Defaults to Infinity for initial load (most recent notifications).
 *                       Use the timestamp of the last notification for pagination.
 * @property limit - Optional maximum number of notifications to return.
 *                   Defaults to NEXUS_NOTIFICATIONS_LIMIT.
 */
export type TGetNotificationsParams = {
  types?: NotificationType[] | null;
  olderThan?: number;
  limit?: number;
};
