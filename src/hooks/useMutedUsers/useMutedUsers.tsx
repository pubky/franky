'use client';

import { useEffect, useMemo } from 'react';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import type { UseMutedUsersResult } from './useMutedUsers.types';

/**
 * useMutedUsers
 *
 * Hook for fetching muted users with their details.
 * Combines data fetching (useEffect) with reactive cache reading (useBulkUserAvatars).
 *
 * Pattern:
 * 1. useEffect: Ensures user details exist (fetch from Nexus if missing)
 * 2. useBulkUserAvatars: Reads current data reactively from local DB
 *
 * @returns Muted users array with details and loading state
 */
export function useMutedUsers(): UseMutedUsersResult {
  const { muted } = Core.useSettingsStore();
  const { getUsersWithAvatars, isLoading: isLoadingUsers } = Hooks.useBulkUserAvatars(muted);

  // Fetch user details for muted users that are not in cache
  useEffect(() => {
    if (muted.length === 0) return;

    const fetchMissingUsers = async () => {
      await Promise.allSettled(
        muted.map((userId) =>
          Core.UserController.getOrFetchDetails({ userId }).catch((error) => {
            console.error(`Failed to fetch user profile for ${userId}:`, error);
          }),
        ),
      );
    };

    void fetchMissingUsers();
  }, [muted]);

  // Transform to MutedUserData format
  const mutedUsers = useMemo(() => {
    return getUsersWithAvatars(muted).map((user) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    }));
  }, [getUsersWithAvatars, muted]);

  return {
    mutedUsers,
    isLoading: isLoadingUsers,
  };
}
