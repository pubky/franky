'use client';

import { createContext, useContext, useCallback } from 'react';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import type { TimelineFeedProps, TimelineFeedContextValue } from './TimelineFeed.types';
import { useTimelineFeedStreamId } from './useTimelineFeedStreamId';
import { useUnreadPosts } from '@/hooks/useUnreadPosts';
import { useIsScrolledFromTop } from '@/hooks/useIsScrolledFromTop';

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
  const { postIds, loading, loadingMore, error, hasMore, loadMore, prependPosts } = Hooks.useStreamPagination({
    streamId,
  });

  // Watch for unread posts from StreamCoordinator polling
  const { unreadCount } = useUnreadPosts({ streamId });

  // Track scroll position to show/hide new posts button
  const isScrolled = useIsScrolledFromTop();

  /**
   * Handle clicking the "New Posts" button
   * 1. Merge unread posts into the main post stream
   * 2. Clear unread stream and prepend posts to UI
   * 3. Scroll to top
   */
  const handleNewPostsClick = useCallback(async () => {
    // Merge unread into post_streams in the database
    await Core.StreamPostsController.mergeUnreadStreamWithPostStream({ streamId });

    // Get and clear unread posts, prepend to UI
    const clearedPostIds = await Core.StreamPostsController.clearUnreadStream({ streamId });
    if (clearedPostIds.length > 0) {
      prependPosts(clearedPostIds);
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [streamId, prependPosts]);

  const contextValue: TimelineFeedContextValue = {
    prependPosts,
  };

  return (
    <TimelineFeedContext.Provider value={contextValue}>
      {children}
      <Molecules.NewPostsButton
        count={unreadCount}
        onClick={handleNewPostsClick}
        visible={unreadCount > 0}
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
