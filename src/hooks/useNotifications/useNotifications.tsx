'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Config from '@/config';
import type { FlatNotification } from '@/core';
import type { UseNotificationsResult } from './useNotifications.types';

/**
 * Hook for notifications with infinite scroll pagination.
 * Uses local cache (via useLiveQuery) for real-time updates from polling,
 * and fetches from Nexus for pagination.
 */
export function useNotifications(): UseNotificationsResult {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const skipRef = useRef<number>(0);
  const loadingRef = useRef(false);

  const { currentUserPubky } = Core.useAuthStore();
  const lastRead = Core.useNotificationStore((s) => s.lastRead);
  const lastReadRef = useRef(lastRead);

  useEffect(() => {
    if (lastReadRef.current === 0 && lastRead > 0) {
      lastReadRef.current = lastRead;
    }
  }, [lastRead]);

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Get all notifications from local cache (reactive to polling updates)
  const cachedNotifications = useLiveQuery(async () => {
    if (!currentUserPubky) return undefined;
    const notifications = await Core.NotificationModel.getAll();
    setInitialLoadDone(true);
    return notifications;
  }, [currentUserPubky]);

  // Sort notifications by timestamp (newest first)
  const notifications = useMemo(() => {
    return [...(cachedNotifications || [])].sort((a, b) => b.timestamp - a.timestamp);
  }, [cachedNotifications]);

  // Loading until initial query completes
  const isLoading = !initialLoadDone;

  /**
   * Load more notifications from Nexus
   */
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !currentUserPubky) return;

    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const newNotifications = await Core.NexusUserService.notifications({
        user_id: currentUserPubky,
        skip: skipRef.current,
        limit: Config.NEXUS_NOTIFICATIONS_LIMIT,
      });

      if (newNotifications.length === 0) {
        setHasMore(false);
        return;
      }

      // Transform and save to cache
      const flatNotifications = newNotifications.map((n) => Core.NotificationNormalizer.toFlatNotification(n));
      await Core.NotificationModel.bulkSave(flatNotifications);

      skipRef.current += newNotifications.length;

      if (newNotifications.length < Config.NEXUS_NOTIFICATIONS_LIMIT) {
        setHasMore(false);
      }
    } catch {
      setError('Failed to load notifications');
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, currentUserPubky]);

  /**
   * Refresh notifications
   */
  const refresh = useCallback(async () => {
    if (!currentUserPubky) return;

    skipRef.current = 0;
    setHasMore(true);

    try {
      const newNotifications = await Core.NexusUserService.notifications({
        user_id: currentUserPubky,
        skip: 0,
        limit: Config.NEXUS_NOTIFICATIONS_LIMIT,
      });

      const flatNotifications = newNotifications.map((n) => Core.NotificationNormalizer.toFlatNotification(n));
      await Core.NotificationModel.bulkSave(flatNotifications);

      skipRef.current = newNotifications.length;
      setHasMore(newNotifications.length >= Config.NEXUS_NOTIFICATIONS_LIMIT);
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
   * Initial load - fetch first page if cache is empty
   */
  useEffect(() => {
    if (!currentUserPubky || isLoading) return;

    // If cache is empty, fetch first page
    if (notifications.length === 0 && hasMore) {
      loadMore();
    } else {
      // Update skip based on cached notifications
      skipRef.current = notifications.length;
    }
  }, [currentUserPubky, isLoading, notifications.length, hasMore, loadMore]);

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
