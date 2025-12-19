'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import type { UsePostCountsResult } from './usePostCounts.types';

/**
 * Hook to get post counts from local database with live updates.
 * This is a lightweight hook that only reads from local cache - no network side effects.
 *
 * Use this when you need cached post counts (replies, reposts, bookmarks) without triggering network fetches.
 *
 * @param compositeId - Composite post ID in format "authorId:postId" (can be null/undefined)
 * @returns Post counts and loading state
 *
 * @example
 * ```tsx
 * const { postCounts, isLoading } = usePostCounts(postId);
 * if (isLoading) return <Skeleton />;
 * return <span>{postCounts?.replies ?? 0} replies</span>;
 * ```
 */
export function usePostCounts(compositeId: string | null | undefined): UsePostCountsResult {
  const postCounts = useLiveQuery(
    async () => {
      if (!compositeId) return null;
      return await Core.PostController.getCounts({ compositeId });
    },
    [compositeId],
    undefined,
  );

  return {
    postCounts,
    isLoading: postCounts === undefined,
  };
}
