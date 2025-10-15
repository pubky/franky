'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

const POSTS_PER_PAGE = 20;

/**
 * Timeline
 *
 * Self-contained component that manages the timeline feed.
 * Handles fetching, loading, infinite scroll, and navigation to posts.
 * No props needed - completely self-contained.
 */
export function Timeline() {
  const [postIds, setPostIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
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

        // Calculate offset
        const skip = isInitialLoad ? 0 : currentPage * POSTS_PER_PAGE;

        // Get post IDs from the stream
        const ids = await Core.PostStreamApplication.read({
          streamId: Core.PostStreamTypes.TIMELINE_ALL,
          limit: POSTS_PER_PAGE,
          skip,
        });

        // Update state based on load type
        if (isInitialLoad) {
          setPostIds(ids);
          setCurrentPage(1);
        } else {
          if (ids.length === 0) {
            setHasMore(false);
            return;
          }
          setPostIds((prevIds) => [...prevIds, ...ids]);
          setCurrentPage((prev) => prev + 1);
        }

        // Check if we have more posts available
        if (ids.length < POSTS_PER_PAGE) {
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
    [currentPage],
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
    <Atoms.Container className="w-full mx-auto">
      <div className="w-full space-y-4 mt-4">
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
