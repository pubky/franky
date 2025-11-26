import type { FlatNotification } from '@/core';

/**
 * Props for the NotificationItem component
 */
export interface NotificationItemProps {
  /**
   * The notification data to display
   */
  notification: FlatNotification;

  /**
   * Whether the notification is unread
   */
  isUnread: boolean;
}
