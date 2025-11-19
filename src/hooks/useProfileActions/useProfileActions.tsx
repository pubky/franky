'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/app';
import * as Hooks from '@/hooks';

export interface ProfileActions {
  onEdit: () => void;
  onCopyPublicKey: () => void;
  onCopyLink: () => void;
  onSignOut: () => void;
  onStatusClick: () => void;
}

export interface UseProfileActionsProps {
  publicKey: string;
  link: string;
}

/**
 * Hook for profile action handlers (navigation and side effects).
 * Pure action handlers - no data fetching or transformation.
 *
 * @param publicKey - The user's public key to copy
 * @param link - The profile link to copy
 * @returns Action handlers
 */
export function useProfileActions({ publicKey, link }: UseProfileActionsProps): ProfileActions {
  const router = useRouter();
  const { copyToClipboard } = Hooks.useCopyToClipboard();

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

  const onStatusClick = useCallback(() => {
    console.log('Status clicked');
    // TODO: Open status picker modal when implemented
  }, []);

  return {
    onEdit,
    onCopyPublicKey,
    onCopyLink,
    onSignOut,
    onStatusClick,
  };
}
