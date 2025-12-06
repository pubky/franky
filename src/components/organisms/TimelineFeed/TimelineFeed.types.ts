import type { ReactNode } from 'react';

export const TIMELINE_FEED_VARIANT = {
  HOME: 'home',
  BOOKMARKS: 'bookmarks',
  PROFILE: 'profile',
} as const;

export type TimelineFeedVariant = (typeof TIMELINE_FEED_VARIANT)[keyof typeof TIMELINE_FEED_VARIANT];

export interface TimelineFeedProps {
  /**
   * Variant determines which stream to fetch
   * - 'home': Uses global filters (sort, reach, content)
   * - 'bookmarks': Uses bookmarks stream with sort/content filters
   * - 'profile': Uses author stream from ProfileContext
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
   * Optimistically add post(s) to the top of the timeline
   * @param postIds - A single post ID or array of post IDs to add
   */
  prependPosts: (postIds: string | string[]) => void;
}
