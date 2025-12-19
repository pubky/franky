'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Types from './usePostDetails.types';

/**
 * Hook to get post details from local database with live updates.
 * This is a lightweight hook that only reads from local cache - no network side effects.
 *
 * Use this when you need cached post data without triggering network fetches.
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
      return await Core.PostController.getDetails({ compositeId });
    },
    [compositeId],
    undefined,
  );

  return {
    postDetails,
    isLoading: postDetails === undefined,
  };
}
