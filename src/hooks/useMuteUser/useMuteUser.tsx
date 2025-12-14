'use client';

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';

export interface UseMuteUserResult {
  isMuted: boolean;
  isMutedLoading: boolean;
  toggleMute: (userId: Core.Pubky, isCurrentlyMuted: boolean) => Promise<void>;
  isLoading: boolean;
  loadingUserId: Core.Pubky | null;
  isUserLoading: (userId: Core.Pubky) => boolean;
  error: string | null;
}

/**
 * useMuteUser
 *
 * Hook for checking mute status and muting/unmuting users.
 * Combines live query for mute status with action handlers.
 *
 * @param targetUserId - Optional user ID to check mute status for
 * @returns Mute status, action handler, loading state, and error state
 *
 * @example
 * ```tsx
 * const { isMuted, toggleMute, isUserLoading } = useMuteUser('pk:abc123');
 *
 * const handleMute = async () => {
 *   await toggleMute(userId, isMuted);
 * };
 * ```
 */
export function useMuteUser(targetUserId?: string): UseMuteUserResult {
  const { currentUserPubky } = Core.useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<Core.Pubky | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live query for mute status
  const relationship = useLiveQuery(
    async () => {
      if (!targetUserId || !currentUserPubky) return null;
      if (targetUserId === currentUserPubky) return null;
      return await Core.UserRelationshipsModel.findById(targetUserId as Core.Pubky);
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

        await Core.UserController.mute(action, {
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
    isMuted,
    isMutedLoading,
    toggleMute,
    isLoading,
    loadingUserId,
    isUserLoading,
    error,
  };
}
