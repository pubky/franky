'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Config from '@/config';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';

export interface TimelinePostsProps {
  /**
   * Optional stream ID to use instead of filters
   * If provided, the component will fetch posts from this stream
   * If not provided, it will use the global filters to determine the stream
   */
  streamId?: Core.PostStreamId;
}

/**
 * TimelinePosts
 *
 * Self-contained component that manages the timeline feed with infinite scroll.
 *
 * Features:
 * - Cursor-based pagination using post ID and timestamp (skip for engagement streams)
 * - Automatic refetching when global filters change
 * - Handles both cache-first and remote fetching strategies
 * - Supports both timeline and engagement stream types
 * - Deduplicates posts to prevent duplicates during pagination
 */
export function TimelinePosts({ streamId: streamIdProp }: TimelinePostsProps = {}) {
  const [postIds, setPostIds] = useState<string[]>([]);
  /**
   * PostId pagination cursor: tracks the last postId from the current page.
   * Primary cursor for cache-based pagination
   */
  const [lastPostId, setLastPostId] = useState<string | undefined>(undefined);
  /**
   * Timestamp cursor: tracks pagination position (timeline streams only).
   * - Cache pagination: unchanged (cache doesn't provide new timestamps). Initializes
   *   with the last cached post timestamp.
   * - Remote fetching: updates to the timestamp of the last post returned
   * Note: For engagement streams, repurposed as a skip count.
   */
  const [streamTail, setStreamTail] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const postIdsRef = useRef<string[]>([]);
  const router = useRouter();

  // Get current streamId based on global filters (only if streamId prop not provided)
  const streamIdFromFilters = Hooks.useStreamIdFromFilters();
  const streamId = streamIdProp ?? streamIdFromFilters;

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
   * Fetches post IDs from the post stream controller
   */
  const fetchStreamSlice = useCallback(
    async (isInitialLoad: boolean) => {
      if (isInitialLoad) {
        const cachedLastPostTimestamp = await Core.StreamPostsController.getCachedLastPostTimestamp(streamId);
        setStreamTail(cachedLastPostTimestamp);
        return await Core.StreamPostsController.getOrFetchStreamSlice({
          streamId,
          // We are in the head of the stream, so we don't have a lastPostId
          lastPostId: undefined,
          streamTail: cachedLastPostTimestamp,
        });
      }

      const isEngagementStream = streamId.startsWith(Core.SORT.ENGAGEMENT);
      // Calculate cursor value based on stream type
      const cursorValue = isEngagementStream
        ? postIdsRef.current.length // Skip count for engagement streams
        : streamTail; // Timestamp for timeline streams

      return await Core.StreamPostsController.getOrFetchStreamSlice({
        streamId,
        lastPostId,
        streamTail: cursorValue,
      });
    },
    [streamId, streamTail, lastPostId],
  );

  /**
   * Updates post state after fetching
   */
  const updatePostState = useCallback((streamChunk: Core.TReadPostStreamChunkResponse, isInitialLoad: boolean) => {
    // Handle empty results - applies to both initial load and pagination
    if (streamChunk.nextPageIds.length === 0) {
      setHasMore(false);
      return;
    }

    if (isInitialLoad) {
      setPostIds(streamChunk.nextPageIds);
      postIdsRef.current = streamChunk.nextPageIds; // Update ref
      // The timestamp only updates when we are already fetching from nexus. Meanwhile, we use the streamTail to paginate.
      // This does not apply for ENGAGEMENT streams.
      if (streamChunk.timestamp) {
        setStreamTail(streamChunk.timestamp);
      }
      const newLastPostId = streamChunk.nextPageIds[streamChunk.nextPageIds.length - 1];
      setLastPostId(newLastPostId);
      return;
    }

    setPostIds((prevIds) => {
      // Deduplicate by creating a Set and then converting back to array
      const combined = [...prevIds, ...streamChunk.nextPageIds];
      const uniqueIds = Array.from(new Set(combined));
      postIdsRef.current = uniqueIds; // Update ref
      return uniqueIds;
    });
    // Update timestamp for pagination if provided
    // Update timestamp for pagination if provided (comes from nexus query)
    if (streamChunk.timestamp !== undefined) {
      setStreamTail(streamChunk.timestamp);
    }
    const newLastPostId = streamChunk.nextPageIds[streamChunk.nextPageIds.length - 1];
    setLastPostId(newLastPostId);
  }, []);

  /**
   * Checks if there are more posts to load
   */
  const checkHasMore = useCallback((fetchedCount: number) => {
    if (fetchedCount < Config.NEXUS_POSTS_PER_PAGE) {
      setHasMore(false);
    }
  }, []);

  /**
   * Main fetch function - orchestrates the fetching process
   */
  const fetchPosts = useCallback(
    async (isInitialLoad: boolean) => {
      try {
        setError(null);
        setLoadingState(isInitialLoad, true);

        const ids = await fetchStreamSlice(isInitialLoad);
        updatePostState(ids, isInitialLoad);
        checkHasMore(ids.nextPageIds.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        Libs.Logger.error('Failed to fetch posts', err);
        // Don't throw - just log and show error state
        // If it's pagination, stop trying to load more
        if (!isInitialLoad) {
          setHasMore(false);
        }
      } finally {
        setLoadingState(isInitialLoad, false);
      }
    },
    [setLoadingState, fetchStreamSlice, updatePostState, checkHasMore],
  );

  const clearState = useCallback(() => {
    setPostIds([]);
    postIdsRef.current = []; // Clear ref
    setStreamTail(0);
    setLastPostId(undefined);
    setHasMore(true);
    setError(null);
  }, []);

  // Initial fetch and refetch when streamId changes (filters change)
  useEffect(() => {
    clearState();
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId]);

  // Load more posts function
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchPosts(false);
  }, [loadingMore, hasMore, fetchPosts]);

  // Infinite scroll hook
  const { sentinelRef } = Hooks.useInfiniteScroll({
    onLoadMore: loadMorePosts,
    hasMore,
    isLoading: loadingMore,
    threshold: 3000,
    debounceMs: 20,
  });

  const handlePostClick = (postId: string) => {
    const [userId, pId] = postId.split(':');
    router.push(`/post/${userId}/${pId}`);
  };

  // Loading state
  if (loading) {
    return <Molecules.TimelineLoading />;
  }

  // Error state (initial load)
  if (error && postIds.length === 0) {
    return <Molecules.TimelineInitialError message={error} />;
  }

  // Empty state
  if (postIds.length === 0) {
    return <Molecules.TimelineEmpty />;
  }

  // Posts list
  return (
    <Atoms.Container>
      <Atoms.Container overrideDefaults className="space-y-4">
        {postIds.map((postId) => (
          <Atoms.Container key={`main_${postId}`}>
            <Organisms.PostMain postId={postId} onClick={() => handlePostClick(postId)} isReply={false} />
            <Organisms.TimelinePostReplies postId={postId} onPostClick={handlePostClick} />
          </Atoms.Container>
        ))}

        {/* Loading More Indicator */}
        {loadingMore && <Molecules.TimelineLoadingMore />}

        {/* Error on loading more */}
        {error && postIds.length > 0 && <Molecules.TimelineError message={error} />}

        {/* End of posts message */}
        {!hasMore && !loadingMore && postIds.length > 0 && <Molecules.TimelineEndMessage />}

        {/* Infinite scroll sentinel */}
        <Atoms.Container overrideDefaults className="h-[20px]" ref={sentinelRef} />
      </Atoms.Container>
    </Atoms.Container>
  );
}
