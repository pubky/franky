'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { AUTH_ROUTES } from '@/app';
import { useLiveQuery } from 'dexie-react-hooks';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import {
  HomeLeftSidebar,
  HomeRightSidebar,
  HomeLeftDrawer,
  HomeRightDrawer,
  HomeLeftDrawerMobile,
  HomeRightDrawerMobile,
} from './Home.sidebars';

const POSTS_PER_PAGE = 2;

export function Home() {
  const [postIds, setPostIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const [showBackupAlert, setShowBackupAlert] = useState(false);

  const { currentUserPubky } = Core.useAuthStore();
  const { secretKey, showWelcomeDialog, setShowWelcomeDialog } = Core.useOnboardingStore();
  const { layout, setLayout, reach, setReach, sort, setSort, content, setContent } = Core.useFiltersStore();

  useEffect(() => {
    if (secretKey) {
      setShowBackupAlert(true);
    }
  }, [secretKey]);

  // Fetch current user details from database
  const userDetails = useLiveQuery(async () => {
    if (!currentUserPubky) return null;
    const details = await Core.ProfileController.read({ user_id: currentUserPubky });
    return details || null;
  }, [currentUserPubky]);

  const handleWelcomeClose = () => {
    // Set welcome dialog to false permanently - it will never show again for this user
    setShowWelcomeDialog(false);
  };

  const handleBackupDismiss = () => {
    setShowBackupAlert(false);
  };

  const handleLogout = () => {
    router.push(AUTH_ROUTES.LOGOUT);
  };

  // Initial fetch
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get post IDs from the stream
        const ids = await Core.StreamController.read({
          streamId: Core.PostStreamTypes.TIMELINE_ALL,
          limit: POSTS_PER_PAGE,
          offset: 0,
        });

        setPostIds(ids);
        setCurrentPage(1);

        // Check if we have more posts available
        if (ids.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }

        console.log('Fetched initial post IDs from stream:', ids);
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

      // Get post IDs from the stream
      const ids = await Core.StreamController.read({
        streamId: Core.PostStreamTypes.TIMELINE_ALL,
        limit: POSTS_PER_PAGE,
        offset,
      });

      if (ids.length === 0) {
        setHasMore(false);
      } else {
        setPostIds((prevIds) => [...prevIds, ...ids]);
        setCurrentPage((prev) => prev + 1);

        // Check if this was the last page
        if (ids.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }

        console.log('Loaded more post IDs from stream:', ids);
      }
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

  const handlePostClick = (postId: string) => {
    const [userId, pId] = postId.split(':');
    router.push(`/post/${userId}/${pId}`);
  };

  return (
    <>
      {userDetails && currentUserPubky && (
        <Organisms.DialogWelcome
          isOpen={showWelcomeDialog}
          onOpenChange={handleWelcomeClose}
          name={userDetails.name}
          pubky={currentUserPubky}
          bio={userDetails.bio}
        />
      )}
      <Organisms.ContentLayout
        leftSidebarContent={
          <HomeLeftSidebar
            reach={reach}
            setReach={setReach}
            sort={sort}
            setSort={setSort}
            content={content}
            setContent={setContent}
            layout={layout}
            setLayout={setLayout}
          />
        }
        rightSidebarContent={<HomeRightSidebar />}
        leftDrawerContent={
          <HomeLeftDrawer
            reach={reach}
            setReach={setReach}
            sort={sort}
            setSort={setSort}
            content={content}
            setContent={setContent}
            layout={layout}
            setLayout={setLayout}
          />
        }
        rightDrawerContent={<HomeRightDrawer />}
        leftDrawerContentMobile={
          <HomeLeftDrawerMobile
            reach={reach}
            setReach={setReach}
            sort={sort}
            setSort={setSort}
            content={content}
            setContent={setContent}
          />
        }
        rightDrawerContentMobile={<HomeRightDrawerMobile />}
      >
        {showBackupAlert && <Organisms.AlertBackup onDismiss={handleBackupDismiss} />}

        <div className="flex items-center justify-between gap-4">
          <Atoms.Heading level={1} size="xl" className="text-2xl">
            Home
          </Atoms.Heading>
          <Atoms.Button id="home-logout-btn" variant="secondary" size="default" onClick={handleLogout}>
            Logout
          </Atoms.Button>
        </div>

        {/* Posts */}
        {loading ? (
          <Atoms.Container className="flex justify-center items-center py-8">
            <Atoms.Typography size="md" className="text-muted-foreground">
              Loading posts...
            </Atoms.Typography>
          </Atoms.Container>
        ) : error && postIds.length === 0 ? (
          <Atoms.Container className="flex justify-center items-center py-8">
            <Atoms.Typography size="md" className="text-destructive">
              Error: {error}
            </Atoms.Typography>
          </Atoms.Container>
        ) : postIds.length === 0 ? (
          <Atoms.Container className="flex justify-center items-center py-8">
            <Atoms.Typography size="md" className="text-muted-foreground">
              No posts found
            </Atoms.Typography>
          </Atoms.Container>
        ) : (
          <Atoms.Container className="w-full mx-auto">
            {/* Posts List */}
            <div className="w-full space-y-4 mt-4">
              {postIds.map((postId, index) => (
                <Organisms.PostMain
                  key={`${postId}-${index}`}
                  postId={postId}
                  onClick={() => handlePostClick(postId)}
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
              {error && postIds.length > 0 && (
                <Atoms.Container className="flex justify-center items-center py-4">
                  <Atoms.Typography size="sm" className="text-destructive">
                    Error loading more posts: {error}
                  </Atoms.Typography>
                </Atoms.Container>
              )}

              {/* End of posts message */}
              {!hasMore && !loadingMore && postIds.length > 0 && (
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
      </Organisms.ContentLayout>
    </>
  );
}
