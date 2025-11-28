'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Core from '@/core';
import { POST_ROUTES } from '@/app/routes';
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
      const { pubky: userId, id: pId } = Core.parseCompositeId(postId);
      router.push(`${POST_ROUTES.POST}/${userId}/${pId}`);
    },
    [router],
  );

  return { navigateToPost };
}
