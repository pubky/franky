'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

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
  const { unreadCount: unreadNotificationsCount } = Hooks.useNotifications();

  // Get tagged count from useTagged hook (for mocked data support)
  // TODO: Remove this when real data is implemented - tags should come from database
  const { count: taggedCount } = Hooks.useTagged();

  // Build stats object from user counts
  // IMPORTANT: Backend counts.posts includes replies, so we subtract to get actual posts
  const totalPosts = userCounts?.posts ?? 0;
  const repliesCount = userCounts?.replies ?? 0;
  const actualPostsCount = Math.max(0, totalPosts - repliesCount);

  // Use tagged count from useTagged if database count is 0 (mocked data scenario)
  // Otherwise use database count
  const databaseTagCount = userCounts?.unique_tags ?? 0;
  const uniqueTagsCount = databaseTagCount > 0 ? databaseTagCount : taggedCount;

  const stats: ProfileStats = {
    notifications: unreadNotificationsCount,
    posts: actualPostsCount,
    replies: repliesCount,
    followers: userCounts?.followers ?? 0,
    following: userCounts?.following ?? 0,
    friends: userCounts?.friends ?? 0,
    uniqueTags: uniqueTagsCount,
  };

  return {
    stats,
    isLoading: !userCounts,
  };
}
