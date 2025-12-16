'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import type { UseIsFollowingResult } from './useIsFollowing.types';

/**
 * useIsFollowing
 *
 * Hook that checks if the current user is following a target user.
 * Uses Dexie's useLiveQuery for reactive updates when the relationship changes.
 *
 * @param targetUserId - The user ID to check if the current user is following
 * @returns Whether the current user is following the target user and loading state
 *
 * @example
 * ```tsx
 * const { isFollowing, isLoading } = useIsFollowing('pk:abc123');
 *
 * if (isLoading) return <Spinner />;
 * return isFollowing ? <UnfollowButton /> : <FollowButton />;
 * ```
 */
export function useIsFollowing(targetUserId: string): UseIsFollowingResult {
  const { currentUserPubky } = Core.useAuthStore();

  const relationship = useLiveQuery(
    async () => {
      if (!targetUserId || !currentUserPubky) return null;
      // Don't check if targeting yourself
      if (targetUserId === currentUserPubky) return null;

      return await Core.UserController.getRelationships({ userId: targetUserId });
    },
    [targetUserId, currentUserPubky],
    null,
  );

  // If no relationship record exists, default to not following
  const isFollowing = relationship?.following ?? false;
  const isLoading = relationship === undefined;

  return {
    isFollowing,
    isLoading,
  };
}
