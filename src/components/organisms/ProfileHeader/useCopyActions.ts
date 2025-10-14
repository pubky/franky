'use client';

import { useCallback } from 'react';

interface UseCopyActionsProps {
  handle: string;
}

interface UseCopyActionsReturn {
  handleCopyPubky: () => Promise<void>;
  handleCopyLink: () => Promise<void>;
}

export function useCopyActions({ handle }: UseCopyActionsProps): UseCopyActionsReturn {
  const handleCopyPubky = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(handle);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy pubky:', error);
    }
  }, [handle]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/profile/${handle}`);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }, [handle]);

  return {
    handleCopyPubky,
    handleCopyLink,
  };
}
