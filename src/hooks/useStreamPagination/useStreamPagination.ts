'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Core from '@/core';
import * as Config from '@/config';
import * as Libs from '@/libs';
import * as Types from './useStreamPagination.types';

/**
 * useStreamPagination
 *
 * Shared hook for managing stream pagination state and logic.
 * Handles initial load, infinite scroll pagination, and state management.
 */
export function useStreamPagination({
  streamId,
  limit = Config.NEXUS_POSTS_PER_PAGE,
  resetOnStreamChange = true,
}: Types.UseStreamPaginationOptions): Types.UseStreamPaginationResult {
  const [postIds, setPostIds] = useState<string[]>([]);
  const [lastPostId, setLastPostId] = useState<string | undefined>(undefined);
  const [streamTail, setStreamTail] = useState<number>(Core.NOT_FOUND_CACHED_STREAM);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const postIdsRef = useRef<string[]>([]);

  /**
   * Sets the appropriate loading state based on load type
   */
  const setLoadingState = useCallback((isInitialLoad: boolean, isLoading: boolean) => {
    if (isInitialLoad) {
      setLoading(isLoading);
    } else {
      setLoadingMore(isLoading);
    }
  }, []);

  /**
   * Fetches a slice from the stream
   */
  const fetchStreamSlice = useCallback(
    async (isInitialLoad: boolean) => {
      setLoadingState(isInitialLoad, true);
      setError(null);

      try {
        let result: Core.TReadPostStreamChunkResponse;

        if (isInitialLoad) {
          const cachedLastPostTimestamp = await Core.StreamPostsController.getCachedLastPostTimestamp({ streamId });
          setStreamTail(cachedLastPostTimestamp);

          result = await Core.StreamPostsController.getOrFetchStreamSlice({
            streamId,
            lastPostId: undefined,
            streamTail: cachedLastPostTimestamp,
            limit,
          });
        } else {
          const isEngagementStream = streamId.startsWith(Core.SORT.ENGAGEMENT);
          const cursorValue = isEngagementStream ? postIdsRef.current.length : streamTail;

          result = await Core.StreamPostsController.getOrFetchStreamSlice({
            streamId,
            lastPostId,
            streamTail: cursorValue,
            limit,
          });
        }

        // Handle empty results
        if (result.nextPageIds.length === 0) {
          Libs.Logger.debug('[useStreamPagination] Empty result, no more posts');
          setHasMore(false);
          setLoadingState(isInitialLoad, false);
          return;
        }

        // Deduplicate posts
        const existingIds = new Set(postIdsRef.current);
        const newUniquePostIds = result.nextPageIds.filter((id) => !existingIds.has(id));

        // Update pagination cursors even if all posts are duplicates
        // (we need to move forward in the stream)
        const lastId = result.nextPageIds[result.nextPageIds.length - 1];
        setLastPostId(lastId);

        if (result.timestamp !== undefined) {
          setStreamTail(result.timestamp);
        }

        // Check hasMore based on original response length
        // If server returns fewer posts than requested, we've reached the end
        const hasMorePosts = result.nextPageIds.length >= limit;
        setHasMore(hasMorePosts);

        // If all posts were duplicates, don't update the UI but keep hasMore state
        if (newUniquePostIds.length === 0) {
          setLoadingState(isInitialLoad, false);
          return;
        }

        // Update state with unique posts only
        const updatedPostIds = isInitialLoad ? newUniquePostIds : [...postIdsRef.current, ...newUniquePostIds];
        postIdsRef.current = updatedPostIds;
        setPostIds(updatedPostIds);
      } catch (err) {
        const errorMessage = Libs.isAppError(err) ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setHasMore(false);
        Libs.Logger.error('Failed to fetch stream slice:', err);
      } finally {
        setLoadingState(isInitialLoad, false);
      }
    },
    [streamId, lastPostId, streamTail, limit, setLoadingState],
  );

  /**
   * Clears all state
   */
  const clearState = useCallback(() => {
    postIdsRef.current = [];
    setPostIds([]);
    setLastPostId(undefined);
    setStreamTail(0);
    setHasMore(true);
    setError(null);
  }, []);

  /**
   * Refresh function - clears state and fetches from beginning
   */
  const refresh = useCallback(async () => {
    clearState();
    await fetchStreamSlice(true);
  }, [clearState, fetchStreamSlice]);

  /**
   * Load more function - fetches next page
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchStreamSlice(false);
  }, [loadingMore, hasMore, fetchStreamSlice]);

  /**
   * Add post(s) to the timeline, sorted by timestamp
   * Maintains chronological order (most recent first) when adding posts
   * @param postIds - A single post ID or array of post IDs to add
   */
  const prependPosts = useCallback(async (postIds: string | string[]) => {
    const idsToAdd = Array.isArray(postIds) ? postIds : [postIds];

    // Filter out posts that already exist to avoid duplicates
    const existingIds = new Set(postIdsRef.current);
    const newIds = idsToAdd.filter((id) => !existingIds.has(id));

    if (newIds.length === 0) {
      return;
    }

    // Combine new and existing posts
    const allIds = [...newIds, ...postIdsRef.current];

    // Fetch post details to get timestamps and sort
    const posts = await Core.PostDetailsModel.findByIdsPreserveOrder(allIds);
    const postTimestamps = allIds.map((postId, index) => ({
      postId,
      timestamp: posts[index]?.indexed_at || 0,
    }));
    const sortedIds = postTimestamps.sort((a, b) => b.timestamp - a.timestamp).map((item) => item.postId);

    postIdsRef.current = sortedIds;
    setPostIds(sortedIds);
  }, []);

  /**
   * Remove post(s) from the timeline
   * Used when posts are deleted to immediately remove them from the UI
   * @param postIds - A single post ID or array of post IDs to remove
   */
  const removePosts = useCallback((postIds: string | string[]) => {
    const idsToRemove = Array.isArray(postIds) ? postIds : [postIds];
    const idsToRemoveSet = new Set(idsToRemove);

    const updatedPostIds = postIdsRef.current.filter((id) => !idsToRemoveSet.has(id));
    postIdsRef.current = updatedPostIds;
    setPostIds(updatedPostIds);
  }, []);

  // Initial load and reset when streamId changes
  useEffect(() => {
    if (resetOnStreamChange) {
      clearState();
    }
    fetchStreamSlice(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId]);

  return {
    postIds,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    prependPosts,
    removePosts,
  };
}
