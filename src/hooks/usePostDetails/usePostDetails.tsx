'use client';

import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Types from './usePostDetails.types';

/**
 * Hook to get post details from local database with live updates.
 * Automatically fetches from network if post is missing from cache.
 *
 * @param compositeId - Composite post ID in format "authorId:postId" (can be null/undefined)
 * @returns Post details and loading state
 *
 * @example
 * ```tsx
 * const { postDetails, isLoading } = usePostDetails(postId);
 * if (isLoading) return <Skeleton />;
 * return <span>{postDetails?.content ?? 'No content'}</span>;
 * ```
 */
export function usePostDetails(compositeId: string | null | undefined): Types.UsePostDetailsResult {
  const postDetails = useLiveQuery(
    async () => {
      if (!compositeId) return null;
      return await Core.PostController.getPostDetails({ compositeId });
    },
    [compositeId],
    undefined,
  );

  // Fetch post if missing from cache (background fetch)
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const fetchingPostsRef = useRef(new Set<string>());
  useEffect(() => {
    let cancelled = false;
    const fetchingSet = fetchingPostsRef.current;

    if (compositeId && !postDetails && !fetchingSet.has(compositeId) && currentUserPubky) {
      fetchingSet.add(compositeId);
      // Fire-and-forget fetch - useLiveQuery will react to DB updates
      Core.PostController.getOrFetchPost({ compositeId, viewerId: currentUserPubky }).finally(() => {
        if (!cancelled) {
          fetchingSet.delete(compositeId);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [compositeId, postDetails, currentUserPubky]);

  return {
    postDetails,
    isLoading: postDetails === undefined,
  };
}
