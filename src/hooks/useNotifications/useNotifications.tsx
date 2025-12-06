'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Core from '@/core';
import { getBusinessKey } from '@/core/models/notification/notification.helpers';
import type { FlatNotification } from '@/core';
import type { UseNotificationsResult } from './useNotifications.types';

/**
 * Hook for notifications with infinite scroll pagination.
 * Fetches directly from NotificationController using timestamp-based pagination.
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<FlatNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const olderThanRef = useRef<number | undefined>(undefined);
  const loadingRef = useRef(false);

  const { currentUserPubky } = Core.useAuthStore();
  const lastRead = Core.useNotificationStore((s) => s.lastRead);
  const lastReadRef = useRef(lastRead);

  useEffect(() => {
    if (lastReadRef.current === 0 && lastRead > 0) {
      lastReadRef.current = lastRead;
    }
  }, [lastRead]);

  /**
   * Perform initial load - fetches first page of notifications
   */
  const performInitialLoad = useCallback(async () => {
    if (!currentUserPubky || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await Core.NotificationController.getOrFetchNotifications({});

      setNotifications(result.notifications);
      olderThanRef.current = result.olderThan;
      setHasMore(result.olderThan !== undefined);
    } catch {
      setError('Failed to load notifications');
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [currentUserPubky]);

  /**
   * Load more notifications using timestamp-based pagination
   */
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !currentUserPubky) return;
    if (olderThanRef.current === undefined) {
      setHasMore(false);
      return;
    }

    loadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await Core.NotificationController.getOrFetchNotifications({
        olderThan: olderThanRef.current,
      });

      setNotifications((prev) => {
        // Deduplicate using businessKey
        const existingKeys = new Set(prev.map(getBusinessKey));
        const newNotifications = result.notifications.filter((n) => !existingKeys.has(getBusinessKey(n)));
        return [...prev, ...newNotifications];
      });
      olderThanRef.current = result.olderThan;
      setHasMore(result.olderThan !== undefined);
    } catch {
      setError('Failed to load more notifications');
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, currentUserPubky]);

  /**
   * Refresh notifications - resets pagination and fetches from start
   */
  const refresh = useCallback(async () => {
    if (!currentUserPubky || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    olderThanRef.current = undefined;
    setHasMore(true);

    try {
      const result = await Core.NotificationController.getOrFetchNotifications({});

      setNotifications(result.notifications);
      olderThanRef.current = result.olderThan;
      setHasMore(result.olderThan !== undefined);
    } catch {
      setError('Failed to refresh notifications');
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [currentUserPubky]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    Core.NotificationController.markAllAsRead();
  }, []);

  /**
   * Check if a notification is unread
   */
  const isNotificationUnread = useCallback((n: FlatNotification) => {
    return n.timestamp > lastReadRef.current;
  }, []);

  /**
   * List of unread notifications
   */
  const unreadNotifications = notifications.filter((n) => n.timestamp > lastReadRef.current);

  /**
   * Initial load - fetch first page when component mounts
   */
  useEffect(() => {
    if (!currentUserPubky) return;
    performInitialLoad();
  }, [currentUserPubky, performInitialLoad]);

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
