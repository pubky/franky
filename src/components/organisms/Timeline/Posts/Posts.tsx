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

/**
 * Timeline
 *
 * Self-contained component that manages the timeline feed.
 * Handles fetching, loading, infinite scroll, and navigation to posts.
 * Uses cursor-based pagination with post_id and timestamp.
 * Automatically updates when global filters change.
 */
export function TimelinePosts() {
  const [postIds, setPostIds] = useState<string[]>([]);
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Use ref to always have access to the latest postIds
  const postIdsRef = useRef<string[]>([]);

  const router = useRouter();

  // Get current streamId based on global filters
  const streamId = Hooks.useStreamIdFromFilters();

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
   * Fetches post IDs from the stream controller
   */
  const fetchStreamSlice = useCallback(
    async (isInitialLoad: boolean) => {
      // Determine if this is an engagement stream (uses skip) or timeline (uses timestamp)
      const isEngagementStream = streamId.split(':')[0] === Core.SORT.ENGAGEMENT;

      if (isInitialLoad) {
        return await Core.StreamPostsController.getOrFetchStreamSlice({
          streamId,
          lastPostId: undefined,
          streamTail: 0, // For initial load: always start at 0
        });
      }

      // Get the latest postIds from ref
      const currentPostIds = postIdsRef.current;
      const lastPostId = currentPostIds[currentPostIds.length - 1];

      // For engagement streams: streamTail = number of posts loaded (skip count)
      // For timeline streams: streamTail = timestamp of last post
      const streamTail = isEngagementStream ? currentPostIds.length : timestamp!;

      return await Core.StreamPostsController.getOrFetchStreamSlice({
        streamId,
        lastPostId: lastPostId,
        streamTail,
      });
    },
    [streamId, timestamp], // Removed postIds from dependencies
  );

  /**
   * Updates post state after fetching
   */
  const updatePostState = useCallback(
    (ids: { nextPageIds: string[]; timestamp: number | undefined }, isInitialLoad: boolean) => {
      if (isInitialLoad) {
        setPostIds(ids.nextPageIds);
        postIdsRef.current = ids.nextPageIds; // Update ref
        // Always update timestamp on initial load, even if undefined (resets stale timestamp)
        setTimestamp(ids.timestamp);
        return;
      }

      // Pagination flow
      if (ids.nextPageIds.length === 0) {
        setHasMore(false);
        return;
      }

      setPostIds((prevIds) => {
        // Deduplicate by creating a Set and then converting back to array
        const combined = [...prevIds, ...ids.nextPageIds];
        const uniqueIds = Array.from(new Set(combined));
        postIdsRef.current = uniqueIds; // Update ref
        return uniqueIds;
      });
      // Update timestamp for pagination if provided
      if (ids.timestamp !== undefined) {
        setTimestamp(ids.timestamp);
      }
    },
    [],
  );

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
    setTimestamp(undefined);
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
