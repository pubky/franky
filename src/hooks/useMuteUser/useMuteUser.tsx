'use client';

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type { UseMuteUserResult } from './useMuteUser.types';

/**
 * useMuteUser
 *
 * Hook for muting/unmuting users and checking mute status.
 * Handles the mute action through the UserController, which manages
 * local database updates and homeserver sync.
 *
 * @param targetUserId - Optional user ID to check mute status for
 * @returns Mute action handler, mute status, loading state, and error state
 *
 * @example
 * ```tsx
 * const { toggleMute, isMuted, isLoading, isUserLoading, error } = useMuteUser('pk:abc123');
 *
 * const handleMute = async () => {
 *   await toggleMute('pk:abc123', isMuted);
 * };
 *
 * // Check if a specific user is loading
 * const showSpinner = isUserLoading('pk:abc123');
 * ```
 */
export function useMuteUser(targetUserId?: string): UseMuteUserResult {
  const { currentUserPubky } = Core.useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<Core.Pubky | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if muted (only if targetUserId is provided)
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

  const isMuted = relationship?.muted ?? false;
  const isMutedLoading = relationship === undefined;

  const toggleMute = useCallback(
    async (userId: Core.Pubky, isCurrentlyMuted: boolean) => {
      if (!currentUserPubky) {
        setError('User not authenticated');
        return;
      }

      if (userId === currentUserPubky) {
        setError('Cannot mute yourself');
        return;
      }

      setIsLoading(true);
      setLoadingUserId(userId);
      setError(null);

      try {
        const action = isCurrentlyMuted ? Core.HomeserverAction.DELETE : Core.HomeserverAction.PUT;

        await Core.UserController.commitMute(action, {
          muter: currentUserPubky,
          mutee: userId,
        });

        Libs.Logger.debug(`[useMuteUser] Successfully ${isCurrentlyMuted ? 'unmuted' : 'muted'} user`, {
          userId,
        });
      } catch (err) {
        const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to update mute status';
        setError(errorMessage);
        Libs.Logger.error('[useMuteUser] Failed to toggle mute:', err);
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
    toggleMute,
    isMuted: targetUserId ? isMuted : undefined,
    isLoading,
    isMutedLoading: targetUserId ? isMutedLoading : false,
    loadingUserId,
    isUserLoading,
    error,
  };
}
