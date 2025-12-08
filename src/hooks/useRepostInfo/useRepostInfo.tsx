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

  // Check if this is a repost
  const relationships = useLiveQuery(async () => {
    return await Core.PostRelationshipsModel.findById(postId);
  }, [postId]);

  // Get original post ID if this is a repost
  const originalPostId = useLiveQuery(async () => {
    if (!relationships?.reposted) return null;
    return Core.buildCompositeIdFromPubkyUri({
      uri: relationships.reposted,
      domain: Core.CompositeIdDomain.POSTS,
    });
  }, [relationships?.reposted]);

  const isRepost = !!relationships?.reposted;
  const repostAuthorId = isRepost ? postId.split(':')[0] : null;
  const isCurrentUserRepost = repostAuthorId !== null && currentUserPubky === repostAuthorId;
  const isLoading = relationships === undefined;

  return {
    isRepost,
    repostAuthorId,
    isCurrentUserRepost,
    originalPostId: originalPostId ?? null,
    isLoading,
  };
}
