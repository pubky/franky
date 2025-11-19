'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

export interface ProfileStats {
  notifications: number;
  posts: number;
  replies: number;
  followers: number;
  following: number;
  friends: number;
  tagged: number;
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
    return await Core.UserController.getCounts(userId);
  }, [userId]);

  // Build stats object from user counts
  const stats: ProfileStats = {
    notifications: 0, // TODO: Get from notifications when implemented
    posts: userCounts?.posts ?? 0,
    replies: userCounts?.replies ?? 0,
    followers: userCounts?.followers ?? 0,
    following: userCounts?.following ?? 0,
    friends: userCounts?.friends ?? 0,
    tagged: userCounts?.tagged ?? 0,
  };

  return {
    stats,
    isLoading: !userCounts,
  };
}
