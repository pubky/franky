'use client';

import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { ProfileStats, UseProfileStatsResult } from './useProfileStats.types';

/**
 * Hook for fetching and transforming user profile statistics.
 * Pure data fetching and transformation - no side effects or actions.
 *
 * @param userId - The user ID to fetch stats for
 * @returns Profile statistics and loading state
 */
export function useProfileStats(userId: string): UseProfileStatsResult {
  // Fetch user counts from local database using live query
  const userCounts = useLiveQuery(async () => {
    try {
      if (!userId) return null;
      return await Core.UserController.getCounts({ userId });
    } catch (error) {
      Libs.Logger.error('[useProfileStats] Failed to query user counts', { userId, error });
      return null;
    }
  }, [userId]);

  // Fetch counts from Nexus if not in local cache
  useEffect(() => {
    if (!userId || userCounts !== null) return;

    let cancelled = false;

    Core.UserController.getOrFetchCounts({ userId }).catch((error) => {
      if (!cancelled) {
        Libs.Logger.error('Failed to fetch user counts:', { userId, error });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, userCounts]);

  // Get unread notifications count reactively from Zustand store
  const unreadNotificationsCount = Core.useNotificationStore((state) => state.selectUnread());

  // Build stats object from user counts
  // IMPORTANT: Backend counts.posts includes replies, so we subtract to get actual posts
  const totalPosts = userCounts?.posts ?? 0;
  const repliesCount = userCounts?.replies ?? 0;
  const actualPostsCount = Math.max(0, totalPosts - repliesCount);

  const stats: ProfileStats = {
    notifications: unreadNotificationsCount,
    posts: actualPostsCount,
    replies: repliesCount,
    followers: userCounts?.followers ?? 0,
    following: userCounts?.following ?? 0,
    friends: userCounts?.friends ?? 0,
    uniqueTags: userCounts?.unique_tags ?? 0,
  };

  // Distinguish between:
  // - undefined: query hasn't run yet → loading
  // - null: query ran but counts not found → loaded, using default 0s
  // - object: query ran and found counts → loaded with data
  return {
    stats,
    isLoading: userCounts === undefined,
  };
}
