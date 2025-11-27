'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Types from './usePostNavigation.types';

/**
 * usePostNavigation
 *
 * Shared hook for post navigation logic.
 * Handles routing to post detail pages.
 */
export function usePostNavigation(): Types.UsePostNavigationResult {
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
