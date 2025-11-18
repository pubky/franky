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
  // Last postId of the current page
  const [streamTail, setStreamTail] = useState<number>(0);
  const [lastPostId, setLastPostId] = useState<string | undefined>(undefined);
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
      //const isEngagementStream = ;

      if (isInitialLoad) {
        const initialCursor = await Core.StreamPostsController.getTimelineInitialCursor(streamId);
        // setLastPostId(lastPostId);
        setStreamTail(initialCursor.streamTail);
        return await Core.StreamPostsController.getOrFetchStreamSlice({
          streamId,
          lastPostId: initialCursor.lastPostId,
          streamTail: initialCursor.streamTail,
        });
      }

      // Get the latest postIds from ref
      //const currentPostIds = postIdsRef.current;
      // const lastPostId = currentPostIds[currentPostIds.length - 1];

      // For engagement streams: streamTail = number of posts loaded (skip count)
      // For timeline streams: streamTail = timestamp of last post
      const isEngagement = streamId.split(':')[0] === Core.SORT.ENGAGEMENT;

      return await Core.StreamPostsController.getOrFetchStreamSlice({
        streamId,
        lastPostId,
        streamTail: isEngagement ? postIdsRef.current.length : streamTail,
      });
    },
    [streamId, streamTail, lastPostId], // Removed postIds from dependencies
  );

  /**
   * Updates post state after fetching
   */
  const updatePostState = useCallback(
    (streamChunk: Core.TReadPostStreamChunkResponse, isInitialLoad: boolean) => {
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
        if (streamChunk.nextPageIds.length > 0) {
          const newLastPostId = streamChunk.nextPageIds[streamChunk.nextPageIds.length - 1];
          setLastPostId(newLastPostId);
        }
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
      if (streamChunk.timestamp !== undefined) {
        setStreamTail(streamChunk.timestamp);
      } 
      if (streamChunk.nextPageIds.length > 0) {
        const newLastPostId = streamChunk.nextPageIds[streamChunk.nextPageIds.length - 1];
        setLastPostId(newLastPostId);
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
    setStreamTail(0);
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
    console.warn('loadMorePosts', lastPostId);
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
            {/* <Organisms.TimelinePostReplies postId={postId} onPostClick={handlePostClick} /> */}
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
