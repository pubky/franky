'use client';

import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import { ProfileStats, UseProfileStatsResult } from './useProfileStats.types';

/**
 * Hook for fetching and transforming user profile statistics.
 * Pure data fetching and transformation - no side effects or actions.
 *
 * Separates concerns:
 * 1. useEffect: Ensures data exists (fetch from Nexus if missing)
 * 2. useLiveQuery: Reads current data reactively from local DB
 *
 * @param userId - The user ID to fetch stats for
 * @returns Profile statistics and loading state
 */
export function useProfileStats(userId: string): UseProfileStatsResult {
  // Separate concern: Ensure data exists (fetch-if-missing)
  // This runs once per userId and triggers getOrFetchCounts
  // which handles the cache-or-fetch logic internally
  useEffect(() => {
    if (!userId) return;

    Core.UserController.getOrFetchCounts({ userId }).catch((error) => {
      console.error('Failed to fetch user counts:', error);
    });
  }, [userId]);

  // Separate concern: Read current data from local database
  // This will reactively update when the database changes
  const userCounts = useLiveQuery(async () => {
    if (!userId) return null;
    return await Core.UserController.getCounts({ userId });
  }, [userId]);

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
