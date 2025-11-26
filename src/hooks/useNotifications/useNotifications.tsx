'use client';

import { useMemo, useCallback } from 'react';
import type { FlatNotification } from '@/core';
import * as Libs from '@/libs';
import { getNotificationText, getUserIdFromNotification } from '@/components/molecules/NotificationItem';

export interface UseNotificationsResult {
  notifications: FlatNotification[];
  unreadNotifications: FlatNotification[];
  count: number;
  unreadCount: number;
  isLoading: boolean;
  markAllAsRead: () => void;
}

/**
 * Hook for fetching and managing notifications.
 *
 * TODO: Implement real data fetching using NotificationStore and NotificationModel.
 * This will fetch notifications from the local database and sync with the homeserver.
 *
 * @returns Notifications array, unread notifications, counts, loading state, and markAsRead method
 */
export function useNotifications(): UseNotificationsResult {
  // TODO: Implement real data fetching here
  // - Fetch notifications from NotificationModel.getRecent()
  // - Calculate unread notifications based on user's lastRead timestamp from store
  // - Implement markAllAsRead to update the store
  const notifications = useMemo(() => {
    return [];
  }, []);

  const unreadNotifications = useMemo(() => {
    return [];
  }, []);

  const markAllAsRead = useCallback(() => {
    // TODO: Implement real mark as read functionality
    // - Update user's lastRead timestamp in the store
    // - Sync to homeserver if needed
  }, []);

  return {
    notifications,
    unreadNotifications,
    count: notifications.length,
    unreadCount: unreadNotifications.length,
    isLoading: false,
    markAllAsRead,
  };
}

/**
 * Get user data for a notification user ID.
 *
 * TODO: Implement real user data fetching using UserController or UserDetailsModel.
 * This should fetch user details from the local database or Nexus API.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getNotificationUserData(userId: string): { name: string; avatar?: string } | null {
  // TODO: Implement real user data fetching
  // - Fetch from UserDetailsModel.findById(userId)
  // - Or fetch from Nexus API if not in local DB
  return null;
}

/**
 * Get all display data needed for a notification item
 */
export interface NotificationDisplayData {
  userName: string;
  avatarUrl?: string;
  notificationText: string;
  timestamp: string;
}

export function getNotificationDisplayData(notification: FlatNotification): NotificationDisplayData {
  const userId = getUserIdFromNotification(notification);
  const userData = userId ? getNotificationUserData(userId) : null;
  const userName = userData?.name || 'User';
  const avatarUrl = userData?.avatar;
  const notificationText = getNotificationText(notification, userName);
  const timestamp = Libs.formatNotificationTime(notification.timestamp);

  return {
    userName,
    avatarUrl,
    notificationText,
    timestamp,
  };
}
