'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import type { UseRepostInfoResult } from './useRepostInfo.types';

/**
 * Hook to get repost information for a post.
 * Checks if a post is a repost and identifies who reposted it.
 *
 * **Usage by Component:**
 * - **PostContent**: Uses `isRepost` and `originalPostId` to render repost preview
 * - **PostMain**: Uses `isRepost` and `isCurrentUserRepost` to show repost header
 *
 * @param postId - Composite post ID in format "authorId:postId"
 * @returns Repost information including whether it's a repost, repost author ID, original post ID, and if current user reposted
 *
 * @example
 * ```tsx
 * // In PostContent - for repost preview
 * const { isRepost, originalPostId } = useRepostInfo(postId);
 * if (isRepost && originalPostId) {
 *   return <PostPreviewCard postId={originalPostId} />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In PostMain - for repost header
 * const { isRepost, isCurrentUserRepost } = useRepostInfo(postId);
 * if (isRepost && isCurrentUserRepost) {
 *   return <RepostHeader onUndo={deletePost} />;
 * }
 * ```
 */
export function useRepostInfo(postId: string): UseRepostInfoResult {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();

  // Read relationships via controller (keeps UI layer from reaching into models directly)
  const relationships = useLiveQuery(async () => {
    try {
      return await Core.PostController.getPostRelationships({ compositeId: postId });
    } catch (error) {
      Libs.Logger.error('[useRepostInfo] Failed to fetch post relationships', {
        postId,
        error,
      });
      return null;
    }
  }, [postId]);

  const isRepost = !!relationships?.reposted;
  const isLoading = relationships === undefined;
  const hasError = relationships === null && !isLoading;

  const originalPostId = relationships?.reposted
    ? (() => {
        try {
          return Core.buildCompositeIdFromPubkyUri({
            uri: relationships.reposted,
            domain: Core.CompositeIdDomain.POSTS,
          });
        } catch (error) {
          Libs.Logger.error('[useRepostInfo] Failed to build composite ID from reposted URI', {
            postId,
            repostedUri: relationships.reposted,
            error,
          });
          return null;
        }
      })()
    : null;

  const repostAuthorId = isRepost
    ? (() => {
        try {
          return Core.parseCompositeId(postId).pubky;
        } catch (error) {
          Libs.Logger.error('[useRepostInfo] Failed to parse composite post ID', {
            postId,
            error,
          });
          return null;
        }
      })()
    : null;

  const isCurrentUserRepost = repostAuthorId !== null && currentUserPubky === repostAuthorId;

  return {
    isRepost,
    repostAuthorId,
    isCurrentUserRepost,
    originalPostId,
    isLoading,
    hasError,
  };
}
