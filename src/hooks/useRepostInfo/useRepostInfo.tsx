'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import type { UseRepostInfoResult } from './useRepostInfo.types';

/**
 * Hook to get repost information for a post.
 * Checks if a post is a repost and identifies who reposted it.
 *
 * @param postId - Composite post ID in format "authorId:postId"
 * @returns Repost information including whether it's a repost, repost author ID, and if current user reposted
 *
 * @example
 * ```tsx
 * const { isRepost, repostAuthorId, isCurrentUserRepost, isLoading } = useRepostInfo(postId);
 *
 * if (isRepost) {
 *   return <RepostIndicator authorId={repostAuthorId} isCurrentUser={isCurrentUserRepost} />;
 * }
 * ```
 */
export function useRepostInfo(postId: string): UseRepostInfoResult {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();

  // Read relationships via controller (keeps UI layer from reaching into models directly)
  const relationships = useLiveQuery(async () => {
    return await Core.PostController.getPostRelationships({ compositeId: postId });
  }, [postId]);

  const isRepost = !!relationships?.reposted;
  const originalPostId = relationships?.reposted
    ? Core.buildCompositeIdFromPubkyUri({ uri: relationships.reposted, domain: Core.CompositeIdDomain.POSTS })
    : null;
  const repostAuthorId = isRepost ? Core.parseCompositeId(postId).pubky : null;
  const isCurrentUserRepost = repostAuthorId !== null && currentUserPubky === repostAuthorId;
  const isLoading = relationships === undefined;

  return {
    isRepost,
    repostAuthorId,
    isCurrentUserRepost,
    originalPostId,
    isLoading,
  };
}
