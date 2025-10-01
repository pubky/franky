'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import * as Atoms from '@/atoms';
import * as Templates from '@/templates';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as App from '@/app';

const POSTS_PER_PAGE = 20;

export function Feed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Core.NexusPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const handleLogout = () => {
    // Just navigate to logout page - logout logic will happen there
    router.push(App.AUTH_ROUTES.LOGOUT);
  };

  // Initial fetch
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedPosts = await Core.PostController.fetch({ limit: POSTS_PER_PAGE, offset: 0 });
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
      const newPosts = await Core.PostController.fetch({ limit: POSTS_PER_PAGE, offset });

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
    router.push(`/post/${post.details.id}`);
  };

  return (
    <Atoms.Container size="container" className="px-6">
      <Atoms.Container size="default" className="items-start mx-0 flex flex-col gap-6">
        <Atoms.Container className="flex items-center justify-between w-full">
          <Atoms.Heading level={1} size="xl" className="text-2xl">
            Feed
          </Atoms.Heading>

          {/* Logout button */}
          <Atoms.Button id="feed-logout-btn" variant="secondary" size="lg" onClick={handleLogout}>
            Logout
          </Atoms.Button>
        </Atoms.Container>

        {/* Posts */}
        {loading ? (
          <Atoms.Container className="flex justify-center items-center py-8">
            <Atoms.Typography size="md" className="text-muted-foreground">
              Loading posts...
            </Atoms.Typography>
          </Atoms.Container>
        ) : error && posts.length === 0 ? (
          <Atoms.Container className="flex justify-center items-center py-8">
            <Atoms.Typography size="md" className="text-destructive">
              Error: {error}
            </Atoms.Typography>
          </Atoms.Container>
        ) : posts.length === 0 ? (
          <Atoms.Container className="flex justify-center items-center py-8">
            <Atoms.Typography size="md" className="text-muted-foreground">
              No posts found
            </Atoms.Typography>
          </Atoms.Container>
        ) : (
          <Atoms.Container className="w-full max-w-2xl mx-auto">
            {/* Posts List */}
            <div className="w-full space-y-4">
              {posts.map((post) => (
                <Templates.PostWide
                  key={post.details.id}
                  postId={post.details.id}
                  clickable={true}
                  onClick={() => handlePostClick(post)}
                />
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
        )}
      </Atoms.Container>
    </Atoms.Container>
  );
}
