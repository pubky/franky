'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Types from './useUserDetails.types';

/**
 * Hook to get user details from local database with live updates.
 * This is a lightweight hook that only reads from local cache - no network side effects.
 *
 * Use this when you need cached user data without triggering network fetches.
 * For full profile fetching with network fallback, use `useUserProfile` instead.
 *
 * @param userId - The user ID to fetch details for (can be null/undefined)
 * @returns User details and loading state
 *
 * @example
 * ```tsx
 * const { userDetails, isLoading } = useUserDetails(userId);
 * if (isLoading) return <Skeleton />;
 * return <span>{userDetails?.name ?? 'Unknown'}</span>;
 * ```
 */
export function useUserDetails(userId: string | null | undefined): Types.UseUserDetailsResult {
  const userDetails = useLiveQuery(
    async () => {
      if (!userId) return null;
      return await Core.UserController.getDetails({ userId });
    },
    [userId],
    undefined,
  );

  return {
    userDetails,
    isLoading: userDetails === undefined,
  };
}
