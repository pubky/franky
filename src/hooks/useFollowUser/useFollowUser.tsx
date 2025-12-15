'use client';

import { useState, useCallback } from 'react';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type { UseFollowUserResult } from './useFollowUser.types';

/**
 * useFollowUser
 *
 * Hook for following/unfollowing users.
 * Handles the follow action through the UserController, which manages
 * local database updates and homeserver sync.
 *
 * @returns Follow action handler, loading state, and error state
 *
 * @example
 * ```tsx
 * const { toggleFollow, isLoading, isUserLoading, error } = useFollowUser();
 *
 * const handleFollow = async (userId: Pubky, isFollowing: boolean) => {
 *   await toggleFollow(userId, isFollowing);
 * };
 *
 * // Check if a specific user is loading
 * const showSpinner = isUserLoading(userId);
 * ```
 */
export function useFollowUser(): UseFollowUserResult {
  const { currentUserPubky } = Core.useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<Core.Pubky | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleFollow = useCallback(
    async (userId: Core.Pubky, isCurrentlyFollowing: boolean) => {
      if (!currentUserPubky) {
        setError('User not authenticated');
        return;
      }

      if (userId === currentUserPubky) {
        setError('Cannot follow yourself');
        return;
      }

      setIsLoading(true);
      setLoadingUserId(userId);
      setError(null);

      try {
        const action = isCurrentlyFollowing ? Core.HomeserverAction.DELETE : Core.HomeserverAction.PUT;

        await Core.UserController.commitFollow(action, {
          follower: currentUserPubky,
          followee: userId,
        });

        Libs.Logger.debug(`[useFollowUser] Successfully ${isCurrentlyFollowing ? 'unfollowed' : 'followed'} user`, {
          userId,
        });
      } catch (err) {
        const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to update follow status';
        setError(errorMessage);
        Libs.Logger.error('[useFollowUser] Failed to toggle follow:', err);
        throw err;
      } finally {
        setIsLoading(false);
        setLoadingUserId(null);
      }
    },
    [currentUserPubky],
  );

  const isUserLoading = useCallback(
    (userId: Core.Pubky) => isLoading && loadingUserId === userId,
    [isLoading, loadingUserId],
  );

  return {
    toggleFollow,
    isLoading,
    loadingUserId,
    isUserLoading,
    error,
  };
}
