import * as Core from '@/core';

export interface UseStreamPaginationOptions {
  /**
   * Stream ID to fetch posts from
   */
  streamId: Core.PostStreamId;
  /**
   * Optional limit for posts per page (defaults to NEXUS_POSTS_PER_PAGE)
   */
  limit?: number;
  /**
   * Whether to reset state when streamId changes
   */
  resetOnStreamChange?: boolean;
}

export interface UseStreamPaginationResult {
  /**
   * Array of post IDs in the current stream
   */
  postIds: string[];
  /**
   * Whether the initial load is in progress
   */
  loading: boolean;
  /**
   * Whether loading more posts (pagination)
   */
  loadingMore: boolean;
  /**
   * Error message if fetch failed
   */
  error: string | null;
  /**
   * Whether there are more posts to load
   */
  hasMore: boolean;
  /**
   * Function to trigger loading more posts
   */
  loadMore: () => Promise<void>;
  /**
   * Function to manually trigger a refresh
   */
  refresh: () => Promise<void>;
}
