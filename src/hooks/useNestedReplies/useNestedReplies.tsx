'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
// Direct imports to avoid circular dependency (this hook is exported from @/hooks)
import { useMutedUsers } from '@/hooks/useMutedUsers';
import { usePostCounts } from '@/hooks/usePostCounts';
import { DEFAULT_MAX_NESTED, DEFAULT_MAX_DEPTH } from './useNestedReplies.constants';
import type { UseNestedRepliesOptions, UseNestedRepliesResult } from './useNestedReplies.types';

/**
 * Hook for fetching and displaying nested replies for a post.
 *
 * This hook:
 * - Gets reply count from local cache (with live updates)
 * - Gets nested reply IDs from local stream cache (with live updates)
 * - Fetches from Nexus if replies exist but aren't cached locally
 * - Returns replies in chronological order (oldest first)
 *
 * @param replyId - The composite post ID to get nested replies for
 * @param options - Configuration options
 * @returns Nested reply IDs, counts, and status flags
 *
 * @example
 * ```tsx
 * const { nestedReplyIds, hasMoreReplies, replyCount } = useNestedReplies(postId, {
 *   maxNestedReplies: 3,
 *   depth: 0,
 *   maxDepth: 1
 * });
 * ```
 */
export function useNestedReplies(
  replyId: string | null | undefined,
  options: UseNestedRepliesOptions = {},
): UseNestedRepliesResult {
  const { maxNestedReplies = DEFAULT_MAX_NESTED, depth = 0, maxDepth = DEFAULT_MAX_DEPTH } = options;

  const [hasFetched, setHasFetched] = useState(false);

  /**
   * Mute filtering for nested replies.
   * This ensures nested reply previews are consistent with timeline mute behavior.
   */
  const { mutedUserIdSet } = useMutedUsers();

  // Get post counts to check reply count
  const { postCounts } = usePostCounts(depth < maxDepth ? replyId : null);
  const replyCount = postCounts?.replies ?? 0;

  // Get nested replies from local cache (in chronological order - oldest first)
  const nestedReplyIds = useLiveQuery(
    async () => {
      if (!replyId || depth >= maxDepth) return [];

      const streamId = Core.buildPostReplyStreamId(replyId);
      const stream = await Core.StreamPostsController.getLocalStream({ streamId });

      if (!stream || stream.stream.length === 0) return [];

      // Stream is stored newest-first, reverse for chronological and take last N
      // Apply mute filter so nested previews match timeline mute behavior.
      const chronological = [...stream.stream].reverse();
      const filtered = Core.MuteFilter.filterPostsSafe(chronological, mutedUserIdSet);
      return filtered.slice(-maxNestedReplies);
    },
    [replyId, maxNestedReplies, depth, maxDepth, mutedUserIdSet],
    [],
  );

  /**
   * Track muted replies count to adjust "View more replies" counter.
   * This ensures the UI shows accurate counts excluding muted users.
   */
  const mutedRepliesCount = useLiveQuery(
    async () => {
      if (!replyId) return 0;
      const streamId = Core.buildPostReplyStreamId(replyId);
      const stream = await Core.StreamPostsController.getLocalStream({ streamId });
      if (!stream || stream.stream.length === 0) return 0;
      // Count how many replies are from muted users
      return stream.stream.filter((id) => Core.MuteFilter.isPostMuted(id, mutedUserIdSet)).length;
    },
    [replyId, mutedUserIdSet],
    0,
  );

  // Fetch from Nexus if post has replies but we don't have them locally
  useEffect(() => {
    if (!replyId) return;
    if (depth >= maxDepth) return;
    if (hasFetched) return;
    if (replyCount === 0) return;
    if (nestedReplyIds.length > 0) return; // Already have some

    let isCancelled = false;

    const fetchNestedReplies = async () => {
      try {
        const streamId = Core.buildPostReplyStreamId(replyId);

        // Fetch from Nexus in ascending order (oldest first)
        await Core.StreamPostsController.getOrFetchStreamSlice({
          streamId,
          streamTail: 0,
          lastPostId: undefined,
          limit: maxNestedReplies,
          order: Core.StreamOrder.ASCENDING,
        });

        if (!isCancelled) {
          setHasFetched(true);
        }
      } catch (error) {
        Libs.Logger.error('Failed to fetch nested replies:', error);
        // Silently fail - nested replies are optional
        if (!isCancelled) {
          setHasFetched(true);
        }
      }
    };

    fetchNestedReplies();

    return () => {
      isCancelled = true;
    };
  }, [replyId, replyCount, nestedReplyIds.length, depth, maxDepth, maxNestedReplies, hasFetched]);

  // Use adjusted count so "View more replies" excludes muted users.
  const adjustedReplyCount = Math.max(0, replyCount - mutedRepliesCount);
  const hasMoreReplies = adjustedReplyCount > nestedReplyIds.length;
  const hasNestedReplies = nestedReplyIds.length > 0;

  return {
    nestedReplyIds,
    hasMoreReplies,
    hasNestedReplies,
    replyCount: adjustedReplyCount,
  };
}
