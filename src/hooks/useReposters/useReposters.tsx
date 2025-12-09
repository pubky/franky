'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import type { UseRepostersResult } from './useReposters.types';

/**
 * Hook to get all people who reposted a post.
 * Returns unique author IDs and full repost information.
 *
 * @param originalPostId - Composite post ID of the original post
 * @returns List of reposter IDs, repost info, total count, and loading state
 *
 * @example
 * ```tsx
 * const { reposterIds, totalCount, isLoading } = useReposters(postId);
 *
 * if (isLoading) return <Skeleton />;
 * return <div>{totalCount} reposts</div>;
 * ```
 */
export function useReposters(originalPostId: string): UseRepostersResult {
  // Get the original post's URI
  const originalPost = useLiveQuery(async () => {
    if (!originalPostId) return null;
    return await Core.PostDetailsModel.findById(originalPostId);
  }, [originalPostId]);

  // Get all reposts of this post
  const reposts = useLiveQuery(async () => {
    if (!originalPost?.uri) return [];
    return await Core.PostRelationshipsModel.getReposts(originalPost.uri);
  }, [originalPost?.uri]);

  // Extract repost info (unique author list, count all reposts)
  const reposters: Array<{ repostId: string; authorId: string }> = [];
  const authorIdSet = new Set<string>();

  if (reposts) {
    reposts.forEach((repost) => {
      // Extract author ID from composite ID (format: "authorId:postId")
      const authorId = repost.id.split(':')[0];
      if (!authorIdSet.has(authorId)) {
        authorIdSet.add(authorId);
        reposters.push({
          repostId: repost.id,
          authorId,
        });
      }
    });
  }

  const reposterIds = Array.from(authorIdSet);
  const totalCount = reposts?.length ?? 0; // count all reposts (including multiple per user)

  return {
    reposterIds,
    reposters,
    totalCount,
    isLoading: originalPost === undefined || reposts === undefined,
  };
}
