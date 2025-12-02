'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
// Import directly to avoid circular dependency with @/hooks barrel
import { useNotifications } from '@/hooks/useNotifications';

export interface ProfileStats {
  notifications: number;
  posts: number;
  replies: number;
  followers: number;
  following: number;
  friends: number;
  uniqueTags: number;
}

export interface UseProfileStatsResult {
  stats: ProfileStats;
  isLoading: boolean;
}

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
    if (!userId) return null;
    return await Core.UserController.getCounts({ userId });
  }, [userId]);

  // Get unread notifications count from useNotifications hook (UI only - using mock data)
  // TODO: Replace with real notification store when backend is integrated
  const { unreadCount: unreadNotificationsCount } = useNotifications();

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
