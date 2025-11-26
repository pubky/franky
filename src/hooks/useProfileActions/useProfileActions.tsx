'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Core from '@/core';
import { AUTH_ROUTES } from '@/app';
import * as Hooks from '@/hooks';

export interface ProfileActions {
  onEdit: () => void;
  onCopyPublicKey: () => void;
  onCopyLink: () => void;
  onSignOut: () => void;
  onStatusChange: (status: string) => void;
}

export interface UseProfileActionsProps {
  publicKey: string;
  link: string;
}

/**
 * Hook for profile action handlers (navigation and side effects).
 * Pure action handlers - no data fetching or transformation.
 *
 * @param publicKey - The user's public key to copy (format: pk:...)
 * @param link - The profile link to copy
 * @returns Action handlers
 */
export function useProfileActions({ publicKey, link }: UseProfileActionsProps): ProfileActions {
  const router = useRouter();
  const { copyToClipboard } = Hooks.useCopyToClipboard();
  const authStore = Core.useAuthStore();

  const onEdit = useCallback(() => {
    console.log('Edit clicked');
    // TODO: Navigate to profile edit page when implemented
  }, []);

  const onCopyPublicKey = useCallback(() => {
    void copyToClipboard(publicKey);
  }, [publicKey, copyToClipboard]);

  const onCopyLink = useCallback(() => {
    void copyToClipboard(link);
  }, [link, copyToClipboard]);

  const onSignOut = useCallback(() => {
    router.push(AUTH_ROUTES.LOGOUT);
  }, [router]);

  const onStatusChange = useCallback(
    async (status: string) => {
      const currentUserPubky = authStore.currentUserPubky;
      if (!currentUserPubky) {
        console.error('No authenticated user found');
        return;
      }

      try {
        await Core.ProfileController.updateStatus({ pubky: currentUserPubky, status });
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    },
    [authStore],
  );

  return {
    onEdit,
    onCopyPublicKey,
    onCopyLink,
    onSignOut,
    onStatusChange,
  };
}
