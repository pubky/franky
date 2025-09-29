'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';

const POSTS_PER_PAGE = 20;

export const Posts = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Core.NexusPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Initial fetch
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedPosts = await Core.PostController.fetch(POSTS_PER_PAGE, 0);
        setPosts(fetchedPosts);
        setCurrentPage(1);

        // Check if we have more posts available
        if (fetchedPosts.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }

        console.log('Fetched initial posts:', fetchedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  // Load more posts function
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      const offset = currentPage * POSTS_PER_PAGE;
      const newPosts = await Core.PostController.fetch(POSTS_PER_PAGE, offset);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setCurrentPage((prev) => prev + 1);

        // Check if this was the last page
        if (newPosts.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
      }

      console.log('Loaded more posts:', newPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts');
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore]);

  // Infinite scroll hook
  const { sentinelRef } = Hooks.useInfiniteScroll({
    onLoadMore: loadMorePosts,
    hasMore,
    isLoading: loadingMore,
    threshold: 300,
    debounceMs: 200,
  });

  const handlePostClick = (post: Core.NexusPost) => {
    const profileId = post.details.author;
    router.push(`/post/${profileId}/${post.details.id}`);
  };

  if (loading) {
    return (
      <Atoms.Container className="flex justify-center items-center py-8">
        <Atoms.Typography size="md" className="text-muted-foreground">
          Loading posts...
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  if (error && posts.length === 0) {
    return (
      <Atoms.Container className="flex justify-center items-center py-8">
        <Atoms.Typography size="md" className="text-destructive">
          Error: {error}
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  if (posts.length === 0) {
    return (
      <Atoms.Container className="flex justify-center items-center py-8">
        <Atoms.Typography size="md" className="text-muted-foreground">
          No posts found
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="w-full max-w-2xl mx-auto">
      {/* Posts List */}
      <div className="w-full space-y-4">
        {posts.map((post) => (
          <div key={post.details.id} onClick={() => handlePostClick(post)}>
            <Molecules.Post post={post} />
          </div>
        ))}

        {/* Loading More Indicator */}
        {loadingMore && (
          <Atoms.Container className="flex justify-center items-center py-8">
            <Atoms.Typography size="md" className="text-muted-foreground">
              Loading more posts...
            </Atoms.Typography>
          </Atoms.Container>
        )}

        {/* Error on loading more */}
        {error && posts.length > 0 && (
          <Atoms.Container className="flex justify-center items-center py-4">
            <Atoms.Typography size="sm" className="text-destructive">
              Error loading more posts: {error}
            </Atoms.Typography>
          </Atoms.Container>
        )}

        {/* End of posts message */}
        {!hasMore && !loadingMore && posts.length > 0 && (
          <Atoms.Container className="flex justify-center items-center py-8">
            <Atoms.Typography size="md" className="text-muted-foreground">
              You&apos;ve reached the end! 🎉
            </Atoms.Typography>
          </Atoms.Container>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: '20px' }} />
      </div>
    </Atoms.Container>
  );
};
