'use client';

import { useState } from 'react';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import type { UseMuteUserResult } from './useMuteUser.types';

/**
 * useMuteUser
 *
 * Hook for muting/unmuting users.
 * Handles the mute action through the UserController, which manages
 * local database updates and homeserver sync.
 *
 * @returns Mute/unmute action handlers, loading state, and error state
 *
 * @example
 * ```tsx
 * const { muteUser, unmuteUser, isLoading, isUserLoading, error } = useMuteUser();
 *
 * const handleMute = async (userId: Pubky) => {
 *   await muteUser(userId);
 * };
 * ```
 */
export function useMuteUser(): UseMuteUserResult {
  const { currentUserPubky } = Core.useAuthStore();
  const { addMutedUser, removeMutedUser } = Core.useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<Core.Pubky | null>(null);
  const [error, setError] = useState<string | null>(null);

  const muteUser = async (userId: Core.Pubky, options?: { silent?: boolean }) => {
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
      await Core.UserController.commitMute(Core.HomeserverAction.PUT, {
        muter: currentUserPubky,
        mutee: userId,
      });

      // Update settings store
      addMutedUser(userId);

      if (!options?.silent) {
        Molecules.toast({
          title: 'User muted',
          description: "You won't see posts from this user anymore",
        });
      }

      Libs.Logger.debug('[useMuteUser] Successfully muted user', { userId });
    } catch (err) {
      const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to mute user';
      setError(errorMessage);

      if (!options?.silent) {
        Molecules.toast({
          title: 'Error',
          description: errorMessage,
        });
      }

      Libs.Logger.error('[useMuteUser] Failed to mute user:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setLoadingUserId(null);
    }
  };

  const unmuteUser = async (userId: Core.Pubky, options?: { silent?: boolean }) => {
    if (!currentUserPubky) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setLoadingUserId(userId);
    setError(null);

    try {
      await Core.UserController.commitMute(Core.HomeserverAction.DELETE, {
        muter: currentUserPubky,
        mutee: userId,
      });

      // Update settings store
      removeMutedUser(userId);

      if (!options?.silent) {
        Molecules.toast({
          title: 'User unmuted',
          description: "You'll see posts from this user again",
        });
      }

      Libs.Logger.debug('[useMuteUser] Successfully unmuted user', { userId });
    } catch (err) {
      const errorMessage = Libs.isAppError(err) ? err.message : 'Failed to unmute user';
      setError(errorMessage);

      if (!options?.silent) {
        Molecules.toast({
          title: 'Error',
          description: errorMessage,
        });
      }

      Libs.Logger.error('[useMuteUser] Failed to unmute user:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setLoadingUserId(null);
    }
  };

  const isUserLoading = (userId: Core.Pubky) => isLoading && loadingUserId === userId;

  return {
    muteUser,
    unmuteUser,
    isLoading,
    loadingUserId,
    isUserLoading,
    error,
  };
}
