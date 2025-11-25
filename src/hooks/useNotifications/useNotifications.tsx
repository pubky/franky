'use client';

import { useMemo } from 'react';
import { FlatNotification } from '@/core/models/notification/notification.types';
import { mockNotifications, mockUserData } from '@/components/templates/ProfilePage/Notifications/mockNotifications';

export interface UseNotificationsResult {
  notifications: FlatNotification[];
  count: number;
  isLoading: boolean;
  // Future: add methods like markAsRead, markAllAsRead, etc.
}

/**
 * Hook for fetching and managing notifications.
 * Currently, uses mock data, but can be easily switched to a real data source.
 *
 * @returns Notifications array, count, and loading state
 */
export function useNotifications(): UseNotificationsResult {
  // In the future, this would fetch from NotificationModel or a service
  // For now, using mock data
  // TODO: Replace with actual data fetching:
  // const notifications = useLiveQuery(() => NotificationModel.getRecent());
  // const isLoading = notifications === undefined;

  const notifications = useMemo(() => {
    // Sort by timestamp descending (newest first)
    return [...mockNotifications].sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  return {
    notifications,
    count: notifications.length,
    isLoading: false,
  };
}

/**
 * Get user data for a notification user ID
 */
export function getNotificationUserData(userId: string) {
  return mockUserData[userId] || null;
}
