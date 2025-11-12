'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Config from '@/config';
import * as Hooks from '@/hooks';

/**
 * Timeline
 *
 * Self-contained component that manages the timeline feed.
 * Handles fetching, loading, infinite scroll, and navigation to posts.
 * Uses cursor-based pagination with post_id and timestamp.
 */
export function Timeline() {
  const [postIds, setPostIds] = useState<string[]>([]);
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  /**
   * Unified fetch function for both initial load and pagination
   */
  const fetchPosts = useCallback(
    async (isInitialLoad: boolean) => {
      try {
        // Set appropriate loading state
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        let ids: { nextPageIds: string[]; timestamp: number | undefined };

        if (isInitialLoad) {
          // Initial load - no cursor
          ids = await Core.StreamPostsController.getOrFetchStreamSlice({
            streamId: Core.PostStreamTypes.TIMELINE_ALL,
            timestamp,
            limit: Config.NEXUS_POSTS_PER_PAGE,
          });
        } else {
          // Pagination - use last post as cursor
          const lastPostId = postIds[postIds.length - 1];

          ids = await Core.StreamPostsController.getOrFetchStreamSlice({
            streamId: Core.PostStreamTypes.TIMELINE_ALL,
            post_id: lastPostId,
            timestamp,
          });
        }

        // Update state based on load type
        if (isInitialLoad) {
          setPostIds(ids.nextPageIds);
          if (ids.timestamp) {
            setTimestamp(ids.timestamp);
          }
        } else {
          if (ids.nextPageIds.length === 0) {
            setHasMore(false);
            return;
          }
          setPostIds((prevIds) => [...prevIds, ...ids.nextPageIds]);
        }

        // Check if we have more posts available
        if (ids.nextPageIds.length < Config.NEXUS_POSTS_PER_PAGE) {
          setHasMore(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        console.error('Error fetching posts:', err);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [postIds, timestamp],
  );

  // Initial fetch
  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <Atoms.Container className="mx-auto w-full">
      <div className="space-y-4">
        {postIds.map((postId, index) => (
          <Organisms.PostMain key={`${postId}-${index}`} postId={postId} onClick={() => handlePostClick(postId)} />
        ))}

        {/* Loading More Indicator */}
        {loadingMore && <Molecules.TimelineLoadingMore />}

        {/* Error on loading more */}
        {error && postIds.length > 0 && <Molecules.TimelineError message={error} />}

        {/* End of posts message */}
        {!hasMore && !loadingMore && postIds.length > 0 && <Molecules.TimelineEndMessage />}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: '20px' }} />
      </div>
    </Atoms.Container>
  );
}
