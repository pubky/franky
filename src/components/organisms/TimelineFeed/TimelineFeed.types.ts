import type { ReactNode } from 'react';

export const TIMELINE_FEED_VARIANT = {
  HOME: 'home',
  BOOKMARKS: 'bookmarks',
  PROFILE: 'profile',
  HOT: 'hot',
  SEARCH: 'search',
} as const;

export type TimelineFeedVariant = (typeof TIMELINE_FEED_VARIANT)[keyof typeof TIMELINE_FEED_VARIANT];

export interface TimelineFeedProps {
  /**
   * Variant determines which stream to fetch
   * - 'home': Uses global filters (sort, reach, content)
   * - 'bookmarks': Uses bookmarks stream with sort/content filters
   * - 'profile': Uses author stream from ProfileContext
   * - 'hot': Uses engagement sorting with reach from hot store
   * - 'search': Uses tags from URL query params with sort/content filters
   */
  variant: TimelineFeedVariant;
  /**
   * Optional children to render above the timeline (e.g., PostInput)
   * Children can access prependPosts via TimelineFeedContext
   */
  children?: ReactNode;
}

export interface TimelineFeedContextValue {
  /**
   * Whether children are allowed to optimistically prepend newly created posts into this feed.
   * NOTE: This is intentionally conservative to avoid injecting posts into unrelated streams
   * (e.g., other users' profile feeds, bookmarks, hot, search).
   */
  canOptimisticallyPrepend: boolean;
  /**
   * Optimistically add post(s) to the top of the timeline
   * @param postIds - A single post ID or array of post IDs to add
   */
  prependPosts: (postIds: string | string[]) => void;
  /**
   * Remove post(s) from the timeline
   * @param postIds - A single post ID or array of post IDs to remove
   */
  removePosts: (postIds: string | string[]) => void;
}
