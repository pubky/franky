'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UsePostNavigationResult {
  /**
   * Navigate to a post detail page using composite ID
   */
  navigateToPost: (postId: string) => void;
}

/**
 * usePostNavigation
 *
 * Shared hook for post navigation logic.
 * Handles routing to post detail pages.
 */
export function usePostNavigation(): UsePostNavigationResult {
  const router = useRouter();

  const navigateToPost = useCallback(
    (postId: string) => {
      const [userId, pId] = postId.split(':');
      router.push(`/post/${userId}/${pId}`);
    },
    [router],
  );

  return { navigateToPost };
}
