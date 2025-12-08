'use client';

import { useMemo } from 'react';
import * as Hooks from '@/hooks';
import type { UseRepostTextResult } from './useRepostText.types';

export interface UseRepostTextOptions {
  /** Whether this is the current user's repost */
  isCurrentUserRepost: boolean;
  /** List of reposter IDs */
  reposterIds: string[];
  /** Total count of reposters */
  repostersCount: number;
  /** Whether reposters are still loading */
  isLoadingReposters: boolean;
  /** Details of the repost author (for single repost fallback) */
  repostAuthorDetails: { name?: string } | null | undefined;
}

/**
 * Hook to format repost text based on reposters and current user.
 * Always uses "You reposted" when current user reposted.
 *
 * @param options - Repost information
 * @returns Formatted repost text and loading state
 *
 * @example
 * ```tsx
 * const { repostText, isLoading } = useRepostText({
 *   isCurrentUserRepost: true,
 *   reposterIds: ['user1', 'user2'],
 *   repostersCount: 2,
 *   isLoadingReposters: false,
 *   repostAuthorDetails: { name: 'John' },
 * });
 *
 * // Returns: "You and 1 others reposted this"
 * ```
 */
export function useRepostText({
  isCurrentUserRepost,
  reposterIds,
  repostersCount,
  isLoadingReposters,
  repostAuthorDetails,
}: UseRepostTextOptions): UseRepostTextResult {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();

  // Get first reposter's details for text formatting
  const firstReposterId = reposterIds.length > 0 ? reposterIds[0] : null;
  const { userDetails: firstReposterDetails } = Hooks.useUserDetails(firstReposterId ?? null);

  // Format repost text - always use "You reposted" when current user reposted
  const repostText = useMemo(() => {
    if (isLoadingReposters || repostersCount === 0) {
      // If this is the current user's repost, always say "You reposted"
      if (isCurrentUserRepost) return 'You reposted';
      if (repostAuthorDetails?.name) return `${repostAuthorDetails.name} reposted`;
      return 'Reposted';
    }

    const currentUserIndex = reposterIds.indexOf(currentUserPubky ?? '');

    if (currentUserIndex >= 0) {
      // Current user is in the list - always say "You reposted" or "You and X others"
      if (repostersCount === 1) return 'You reposted';
      return `You and ${repostersCount - 1} others reposted this`;
    } else {
      // Current user is not in the list
      if (repostersCount === 1) {
        // Show first reposter's name (fallback to repostAuthorDetails if available)
        const name = firstReposterDetails?.name || repostAuthorDetails?.name;
        return name ? `${name} reposted` : 'Reposted';
      }
      // Show first reposter's name and count
      const firstName = firstReposterDetails?.name || repostAuthorDetails?.name || 'Someone';
      return `${firstName} and ${repostersCount - 1} others reposted this`;
    }
  }, [
    isLoadingReposters,
    repostersCount,
    reposterIds,
    currentUserPubky,
    isCurrentUserRepost,
    repostAuthorDetails,
    firstReposterDetails,
  ]);

  return {
    repostText,
    isLoading: isLoadingReposters,
  };
}
