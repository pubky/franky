'use client';

import { useCallback } from 'react';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

/**
 * Hook to fetch a post if it's missing from the local database.
 * Useful for fetching original posts when viewing reposts.
 *
 * @returns Fetch function and loading state
 *
 * @example
 * ```tsx
 * const { fetchPost, isFetching } = useFetchPost();
 *
 * if (!postDetails && !isFetching) {
 *   fetchPost(postId);
 * }
 * ```
 */
export function useFetchPost() {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();

  const fetchPost = useCallback(
    async (postId: string) => {
      if (!currentUserPubky) return;
      // Fire-and-forget fetch - useLiveQuery will react to DB updates
      await Core.PostController.getOrFetchPost({ compositeId: postId, viewerId: currentUserPubky });
    },
    [currentUserPubky],
  );

  return {
    fetchPost,
    isFetching: false,
  };
}
