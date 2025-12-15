'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Core from '@/core';
import { AUTH_ROUTES, SETTINGS_ROUTES } from '@/app';
// Import directly to avoid circular dependency with @/hooks barrel
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export interface ProfileActions {
  onEdit: () => void;
  onCopyPublicKey: () => void;
  onCopyLink: () => void;
  onSignOut: () => void;
  onStatusChange: (status: string) => void;
  isLoggingOut: boolean;
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
  const { copyToClipboard } = useCopyToClipboard();
  const authStore = Core.useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onEdit = useCallback(() => {
    router.push(SETTINGS_ROUTES.EDIT);
  }, [router]);

  const onCopyPublicKey = useCallback(() => {
    void copyToClipboard(publicKey);
  }, [publicKey, copyToClipboard]);

  const onCopyLink = useCallback(() => {
    void copyToClipboard(link);
  }, [link, copyToClipboard]);

  const onSignOut = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await Core.AuthController.logout();
      router.push(AUTH_ROUTES.LOGOUT);
    } catch (error) {
      console.error('Failed to logout:', error);
      setIsLoggingOut(false);
    }
  }, [router]);

  const onStatusChange = useCallback(
    async (status: string) => {
      const currentUserPubky = authStore.currentUserPubky;
      if (!currentUserPubky) {
        console.error('No authenticated user found');
        return;
      }

      try {
        await Core.ProfileController.commitUpdateDetailsStatus({ pubky: currentUserPubky, status });
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
    isLoggingOut,
  };
}
