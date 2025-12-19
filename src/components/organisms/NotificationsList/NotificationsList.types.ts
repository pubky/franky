import type { FlatNotification } from '@/core';

/**
 * Props for the NotificationsList component
 */
export interface NotificationsListProps {
  /**
   * Array of all notifications to display
   */
  notifications: FlatNotification[];

  /**
   * Array of unread notifications (used to determine which notifications should show the unread badge)
   */
  unreadNotifications: FlatNotification[];
}
