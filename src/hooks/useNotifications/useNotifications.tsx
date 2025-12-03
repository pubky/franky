'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import type { FlatNotification } from '@/core';
import type { UseNotificationsResult } from './useNotifications.types';

/**
 * Hook for notifications with infinite scroll pagination.
 * Uses local cache (via useLiveQuery) for real-time updates from polling,
 * and fetches from Nexus for pagination via NotificationController.
 */
export function useNotifications(): UseNotificationsResult {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const olderThanRef = useRef<number | undefined>(Infinity);
  const loadingRef = useRef(false);
  const initialLoadTriggeredRef = useRef(false);

  const { currentUserPubky } = Core.useAuthStore();
  const lastRead = Core.useNotificationStore((s) => s.lastRead);
  const lastReadRef = useRef(lastRead);

  useEffect(() => {
    if (lastReadRef.current === 0 && lastRead > 0) {
      lastReadRef.current = lastRead;
    }
  }, [lastRead]);

  // Get all notifications from local cache (reactive to polling updates)
  const cachedNotifications = useLiveQuery(async () => {
    if (!currentUserPubky) return undefined;
    return await Core.NotificationModel.getAll();
  }, [currentUserPubky]);

  // Sort notifications by timestamp (newest first)
  // useLiveQuery is needed for reactive updates when coordinator polls and saves new notifications
  const notifications = useMemo(() => {
    if (!cachedNotifications || cachedNotifications.length === 0) return [];
    
    return [...cachedNotifications].sort((a, b) => b.timestamp - a.timestamp);
  }, [cachedNotifications]);

  /**
   * Perform initial load - fetches first page of notifications
   */
  const performInitialLoad = useCallback(async () => {
    if (!currentUserPubky || initialLoadTriggeredRef.current) return;

    initialLoadTriggeredRef.current = true;
    setIsLoading(true);

    try {
      // Empty object - controller defaults olderThan to Infinity
      const result = await Core.NotificationController.getOrFetchNotifications({});

      olderThanRef.current = result.olderThan;
      setHasMore(result.olderThan !== undefined);
    } catch {
      setError('Failed to load notifications');
    } finally {
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

    try {
      const result = await Core.NotificationController.getOrFetchNotifications({
        olderThan: olderThanRef.current,
      });

      olderThanRef.current = result.olderThan;
      setHasMore(result.olderThan !== undefined);
    } catch {
      setError('Failed to load notifications');
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, currentUserPubky]);

  /**
   * Refresh notifications - resets pagination and fetches from start
   */
  const refresh = useCallback(async () => {
    if (!currentUserPubky) return;

    olderThanRef.current = Infinity;
    setHasMore(true);
    initialLoadTriggeredRef.current = false; // Allow re-initial load

    try {
      // Empty object - controller defaults olderThan to Infinity
      const result = await Core.NotificationController.getOrFetchNotifications({});

      olderThanRef.current = result.olderThan;
      setHasMore(result.olderThan !== undefined);
    } catch {
      setError('Failed to load notifications');
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
  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => n.timestamp > lastReadRef.current);
  }, [notifications]);

  /**
   * Initial load - fetch first page when component mounts
   */
  useEffect(() => {
    if (!currentUserPubky) return;
    performInitialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserPubky]);

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
