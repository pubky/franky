import type * as Core from '@/core';

export interface UseUnreadPostsOptions {
  /**
   * Stream ID to watch for unread posts
   */
  streamId: Core.PostStreamId | null;
}

export interface UseUnreadPostsResult {
  /**
   * Array of unread post IDs
   */
  unreadPostIds: string[];
  /**
   * Number of unread posts
   */
  unreadCount: number;
}
