'use client';

import { createContext, useContext, useCallback, useMemo } from 'react';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import type { TimelineFeedProps, TimelineFeedContextValue } from './TimelineFeed.types';
import { useTimelineFeedStreamId } from './useTimelineFeedStreamId';

/**
 * Context for timeline feed operations
 * Allows children (like PostInput) to access prependPosts
 */
const TimelineFeedContext = createContext<TimelineFeedContextValue | null>(null);

/**
 * Hook to access the timeline feed context
 *
 * @returns The timeline feed context value or null if not inside TimelineFeed
 *
 * @example
 * ```tsx
 * function PostInput() {
 *   const timelineFeed = useTimelineFeedContext();
 *
 *   const handlePostSuccess = (postId: string) => {
 *     timelineFeed?.prependPosts(postId);
 *   };
 * }
 * ```
 */
export function useTimelineFeedContext(): TimelineFeedContextValue | null {
  return useContext(TimelineFeedContext);
}

/**
 * TimelineFeed
 *
 * Organism that encapsulates stream calculation and pagination logic.
 * Provides a context for prependPosts coordination with children components.
 *
 * @example
 * ```tsx
 * // Home page with PostInput
 * <TimelineFeed variant="home">
 *   <PostInput variant="post" />
 * </TimelineFeed>
 *
 * // Bookmarks page (no children)
 * <TimelineFeed variant="bookmarks" />
 *
 * // Profile page (inside ProfileProvider)
 * <TimelineFeed variant="profile" />
 * ```
 */
export function TimelineFeed({ variant, children }: TimelineFeedProps) {
  const streamId = useTimelineFeedStreamId(variant);

  // Show loading state while waiting for stream ID (e.g., profile data loading)
  if (!streamId) {
    return <Molecules.TimelineLoading />;
  }

  return (
    <TimelineFeedContent streamId={streamId} variant={variant}>
      {children}
    </TimelineFeedContent>
  );
}

/**
 * Internal component that handles the actual timeline rendering
 * Separated to avoid calling hooks conditionally
 */
function TimelineFeedContent({
  streamId,
  children,
}: {
  streamId: Core.PostStreamId;
  variant: TimelineFeedProps['variant'];
  children?: TimelineFeedProps['children'];
}) {
  const {
    postIds: rawPostIds,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    prependPosts,
  } = Hooks.useStreamPagination({
    streamId,
  });

  // Deduplicate postIds to prevent React key errors from race conditions
  const postIds = useMemo(() => [...new Set(rawPostIds)], [rawPostIds]);

  // Watch for unread posts from StreamCoordinator polling
  const { unreadPostIds } = Hooks.useUnreadPosts({ streamId });

  // Track scroll position to show/hide new posts button
  const isScrolled = Hooks.useIsScrolledFromTop();

  // Filter out posts that are already displayed in the timeline
  // This prevents showing "See new posts" for posts the user just created
  const actualNewPostIds = useMemo(() => {
    const displayedPostIds = new Set(postIds);
    return unreadPostIds.filter((id) => !displayedPostIds.has(id));
  }, [unreadPostIds, postIds]);

  const actualNewCount = actualNewPostIds.length;

  /**
   * Handle clicking the "New Posts" button
   * 1. Merge unread posts into the main post stream
   * 2. Clear unread stream and prepend only the actual new posts to UI
   * 3. Scroll to top
   */
  const handleNewPostsClick = useCallback(async () => {
    try {
      // Merge unread into post_streams in the database
      await Core.StreamPostsController.mergeUnreadStreamWithPostStream({ streamId });

      // Clear unread stream
      await Core.StreamPostsController.clearUnreadStream({ streamId });

      // Only prepend posts that aren't already displayed
      if (actualNewPostIds.length > 0) {
        prependPosts(actualNewPostIds);
      }

      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to load new posts:', error);
      Molecules.toast({
        title: 'Failed to load new posts',
        description: 'Unable to display new posts. Please try again.',
      });
    }
  }, [streamId, prependPosts, actualNewPostIds]);

  const contextValue: TimelineFeedContextValue = {
    prependPosts,
  };

  return (
    <TimelineFeedContext.Provider value={contextValue}>
      {children}
      <Molecules.NewPostsButton
        count={actualNewCount}
        onClick={handleNewPostsClick}
        visible={actualNewCount > 0}
        isScrolled={isScrolled}
      />
      <Organisms.TimelinePosts
        postIds={postIds}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        loadMore={loadMore}
      />
    </TimelineFeedContext.Provider>
  );
}
