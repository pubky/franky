'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';

export interface UseParentPostDeletedResult {
  /** True if the parent post is deleted, false otherwise */
  isParentDeleted: boolean;
  /** True while the query is loading */
  isLoading: boolean;
}

/**
 * Hook to check if a parent post is deleted.
 * Used to determine replyability - deleted posts must not show Quick Reply.
 *
 * @param compositeId - Composite post ID in format "authorId:postId" (can be null/undefined)
 * @returns Boolean indicating if the parent post is deleted, and loading state
 *
 * @example
 * ```tsx
 * const { isParentDeleted, isLoading } = useParentPostDeleted(postId);
 * if (isLoading) return null;
 * if (isParentDeleted) return null; // Don't show Quick Reply
 * return <QuickReply parentPostId={postId} />;
 * ```
 */
export function useParentPostDeleted(compositeId: string | null | undefined): UseParentPostDeletedResult {
  const parentPost = useLiveQuery(
    async () => {
      if (!compositeId) return null;
      return await Core.PostController.getPostDetails({ compositeId });
    },
    [compositeId, 'details'],
    undefined,
  );

  const isParentDeleted = Libs.isPostDeleted(parentPost?.content);

  return {
    isParentDeleted,
    isLoading: parentPost === undefined,
  };
}
