'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Config from '@/config';
import * as Libs from '@/libs';
import type { FlatNotification } from '@/core';
import type { UseNotificationsResult } from './useNotifications.types';

/**
 * Deduplicate notifications using unique keys
 */
function deduplicateNotifications(notifications: FlatNotification[]): FlatNotification[] {
  const uniqueMap = new Map<string, FlatNotification>();
  for (const notification of notifications) {
    const key = Core.getNotificationKey(notification);
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, notification);
    }
  }
  return Array.from(uniqueMap.values());
}

/**
 * Hook for fetching and managing notifications with pagination.
 *
 * Uses useLiveQuery to read from local database for persistence across page navigation.
 * Fetches from Nexus API when loading more notifications.
 *
 * @returns Notifications array, unread notifications, counts, loading states, pagination methods
 */
export function useNotifications(): UseNotificationsResult {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Use refs for values that need to be accessed in callbacks without causing re-renders
  const hasMoreRef = useRef(true);
  const isLoadingMoreRef = useRef(false);

  // Get lastRead from notification store
  const lastRead = Core.useNotificationStore((state) => state.lastRead);

  // Capture the lastRead value when the hook first mounts
  // This is used to show which notifications were unread when the user entered the page
  // Even after markAllAsRead() is called, these notifications will still appear as "new" visually
  const capturedLastReadRef = useRef<number | null>(null);
  if (capturedLastReadRef.current === null && lastRead > 0) {
    capturedLastReadRef.current = lastRead;
  }

  // Read notifications from local database using useLiveQuery
  // This provides persistence across page navigation
  const dbNotifications = useLiveQuery(async () => {
    // Get all notifications from database, ordered by timestamp descending
    const notifications = await Core.NotificationModel.table.orderBy('timestamp').reverse().toArray();
    return notifications;
  }, []);

  // Deduplicate notifications (database may have duplicates due to ++id schema)
  const notifications = useMemo(() => {
    if (!dbNotifications) return [];
    return deduplicateNotifications(dbNotifications);
  }, [dbNotifications]);

  // Calculate if still loading initial data
  const isLoading = dbNotifications === undefined;

  /**
   * Fetches more notifications from the API
   */
  const fetchMoreNotifications = useCallback(async () => {
    // Prevent concurrent pagination requests
    if (isLoadingMoreRef.current) return;
    if (!hasMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      // Get the oldest notification timestamp for pagination
      const oldestTimestamp = notifications.length > 0 ? Math.min(...notifications.map((n) => n.timestamp)) : Infinity;

      const result = await Core.NotificationController.getOrFetchNotifications({
        olderThan: oldestTimestamp,
        limit: Config.NEXUS_NOTIFICATIONS_LIMIT,
      });

      // Determine if there are more notifications
      const hasMoreNotifications =
        result.olderThan !== undefined && result.notifications.length >= Config.NEXUS_NOTIFICATIONS_LIMIT;
      hasMoreRef.current = hasMoreNotifications;
      setHasMore(hasMoreNotifications);

      // Notifications are automatically persisted to the database by the controller
      // useLiveQuery will automatically update when the database changes
    } catch (err) {
      const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      hasMoreRef.current = false;
      setHasMore(false);
      Libs.Logger.error('Failed to fetch notifications:', err);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [notifications]);

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(async () => {
    await fetchMoreNotifications();
  }, [fetchMoreNotifications]);

  /**
   * Refresh notifications - fetch latest from API
   */
  const refresh = useCallback(async () => {
    hasMoreRef.current = true;
    isLoadingMoreRef.current = false;
    setHasMore(true);
    setError(null);

    try {
      // Fetch the most recent notifications
      await Core.NotificationController.getOrFetchNotifications({
        olderThan: Infinity,
        limit: Config.NEXUS_NOTIFICATIONS_LIMIT,
      });
    } catch (err) {
      const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to refresh notifications';
      setError(errorMessage);
      Libs.Logger.error('Failed to refresh notifications:', err);
    }
  }, []);

  /**
   * Mark all notifications as read by updating lastRead timestamp on homeserver and local store
   */
  const markAllAsRead = useCallback(() => {
    // Call controller to update homeserver and local store
    Core.NotificationController.markAllAsRead();
  }, []);

  /**
   * Check if a notification was unread when the user entered the page.
   * Uses the captured lastRead value, not the current store value.
   */
  const isNotificationUnread = useCallback(
    (notification: FlatNotification): boolean => {
      const threshold = capturedLastReadRef.current ?? lastRead;
      return notification.timestamp > threshold;
    },
    [lastRead],
  );

  /**
   * Calculate unread notifications based on captured lastRead timestamp.
   * These are notifications that were unread when the user entered the page.
   */
  const unreadNotifications = useMemo(() => {
    const threshold = capturedLastReadRef.current ?? lastRead;
    return notifications.filter((n) => n.timestamp > threshold);
  }, [notifications, lastRead]);

  // Initial load - fetch notifications if database is empty
  useEffect(() => {
    if (initialLoadDone) return;
    if (dbNotifications === undefined) return; // Still loading from DB

    setInitialLoadDone(true);

    // If no notifications in database, fetch from API
    if (dbNotifications.length === 0) {
      Core.NotificationController.getOrFetchNotifications({
        olderThan: Infinity,
        limit: Config.NEXUS_NOTIFICATIONS_LIMIT,
      }).catch((err) => {
        setError(Libs.isAppError(err) ? err.message : 'Failed to load notifications');
        Libs.Logger.error('Failed to fetch initial notifications:', err);
      });
    }
  }, [dbNotifications, initialLoadDone]);

  return {
    notifications,
    unreadNotifications,
    count: notifications.length,
    unreadCount: unreadNotifications.length,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    markAllAsRead,
    isNotificationUnread,
  };
}
