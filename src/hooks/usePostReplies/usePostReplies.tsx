'use client';

import { useCallback, useEffect, useState } from 'react';

import * as Core from '@/core';
import * as Libs from '@/libs';
import { REPLIES_PER_PAGE } from './usePostReplies.constants';
import type { UsePostRepliesOptions, UsePostRepliesResult } from './usePostReplies.types';

/**
 * Hook for fetching and paginating replies to a post in chronological order (oldest first).
 *
 * Uses StreamOrder.ASCENDING to get posts from the API in chronological order directly.
 * - Initial load: shows the oldest N replies first
 * - "Load more": fetches newer replies and APPENDS them to the list
 *
 * This creates a natural thread view where oldest replies are at top.
 *
 * @param postId - The composite post ID (authorId:postId) to fetch replies for
 * @param options - Configuration options
 * @returns Object with reply IDs (chronological), loading states, and pagination functions
 */
export function usePostReplies(
  postId: string | null | undefined,
  options: UsePostRepliesOptions = {},
): UsePostRepliesResult {
  const { limit = REPLIES_PER_PAGE } = options;

  // Reply IDs stored in chronological order (oldest first)
  const [replyIds, setReplyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Track pagination cursor - points to newest post we have (for fetching newer)
  const [newestPostId, setNewestPostId] = useState<string | undefined>(undefined);
  const [newestTimestamp, setNewestTimestamp] = useState<number>(0);

  // Fetch initial replies when postId changes
  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      setReplyIds([]);
      setHasMore(true);
      setNewestPostId(undefined);
      setNewestTimestamp(0);

      try {
        const streamId = Core.buildPostReplyStreamId(postId);

        // Fetch replies in ascending order (oldest first) from API
        const response = await Core.StreamPostsController.getOrFetchStreamSlice({
          streamId,
          streamTail: 0,
          lastPostId: undefined,
          limit,
          order: Core.StreamOrder.ASCENDING,
        });

        if (isCancelled) return;

        // API returns [oldest, ..., newest] when order=ascending
        const apiIds = response.nextPageIds;

        if (apiIds.length === 0) {
          setHasMore(false);
        } else {
          setReplyIds(apiIds);

          // Track the newest for "load more" (last in list = newest)
          setNewestPostId(apiIds[apiIds.length - 1]);
          if (response.timestamp !== undefined && response.timestamp > 0) {
            setNewestTimestamp(response.timestamp);
          }
          setHasMore(apiIds.length >= limit);
        }
      } catch (err) {
        if (isCancelled) return;
        Libs.Logger.error('Failed to fetch post replies:', err);
        setError('Failed to load replies');
        setHasMore(false);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isCancelled = true;
    };
  }, [postId, limit]);

  // Load more newer replies (appends to list)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading || !postId) return;

    setLoadingMore(true);
    setError(null);

    try {
      const streamId = Core.buildPostReplyStreamId(postId);

      // Fetch posts newer than our newest (ascending order continues from where we left off)
      const response = await Core.StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: newestTimestamp,
        lastPostId: newestPostId,
        limit,
        order: Core.StreamOrder.ASCENDING,
      });

      // API returns [older_in_batch, ..., newest_in_batch] in ascending order
      const apiIds = response.nextPageIds;

      if (apiIds.length === 0) {
        setHasMore(false);
      } else {
        // Deduplicate
        const existingIds = new Set(replyIds);
        const uniqueNewIds = apiIds.filter((id) => !existingIds.has(id));

        if (uniqueNewIds.length > 0) {
          // APPEND newer posts to the end (they come after our current newest)
          setReplyIds((prev) => [...prev, ...uniqueNewIds]);

          // Update cursor to the new newest (last in appended list)
          setNewestPostId(uniqueNewIds[uniqueNewIds.length - 1]);
        }

        if (response.timestamp !== undefined && response.timestamp > 0) {
          setNewestTimestamp(response.timestamp);
        }
        setHasMore(apiIds.length >= limit);
      }
    } catch (err) {
      Libs.Logger.error('Failed to load more replies:', err);
      setError('Failed to load more replies');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loading, postId, newestTimestamp, newestPostId, limit, replyIds]);

  // Prepend a newly created reply to the list (used after local reply creation)
  // Since replies are displayed in chronological order (oldest first),
  // the new reply goes at the END of the list (it's the newest)
  const prependReply = useCallback(
    (replyId: string) => {
      // Check if already exists
      if (replyIds.includes(replyId)) return;

      // Add to the end (newest position in chronological order)
      setReplyIds((prev) => [...prev, replyId]);

      // Update cursor to point to this new reply
      setNewestPostId(replyId);
    },
    [replyIds],
  );

  // Refresh function
  const refresh = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);
    setReplyIds([]);
    setHasMore(true);
    setNewestPostId(undefined);
    setNewestTimestamp(0);

    try {
      const streamId = Core.buildPostReplyStreamId(postId);

      const response = await Core.StreamPostsController.getOrFetchStreamSlice({
        streamId,
        streamTail: 0,
        lastPostId: undefined,
        limit,
        order: Core.StreamOrder.ASCENDING,
      });

      const apiIds = response.nextPageIds;

      if (apiIds.length === 0) {
        setHasMore(false);
      } else {
        setReplyIds(apiIds);
        setNewestPostId(apiIds[apiIds.length - 1]);
        if (response.timestamp !== undefined && response.timestamp > 0) {
          setNewestTimestamp(response.timestamp);
        }
        setHasMore(apiIds.length >= limit);
      }
    } catch (err) {
      Libs.Logger.error('Failed to refresh replies:', err);
      setError('Failed to load replies');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [postId, limit]);

  return {
    replyIds,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    prependReply,
  };
}
