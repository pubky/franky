export interface UsePostRepliesOptions {
  /**
   * Number of replies to fetch per page
   * @default 10
   */
  limit?: number;
}

export interface UsePostRepliesResult {
  /**
   * Array of reply post IDs
   */
  replyIds: string[];
  /**
   * Whether the initial load is in progress
   */
  loading: boolean;
  /**
   * Whether loading more replies (pagination)
   */
  loadingMore: boolean;
  /**
   * Error message if fetch failed
   */
  error: string | null;
  /**
   * Whether there are more replies to load
   */
  hasMore: boolean;
  /**
   * Function to trigger loading more replies
   */
  loadMore: () => Promise<void>;
  /**
   * Function to manually refresh replies
   */
  refresh: () => Promise<void>;
  /**
   * Function to prepend a newly created reply to the list.
   * Used after local reply creation to immediately show the reply
   * without waiting for Nexus to index it.
   */
  prependReply: (replyId: string) => void;
}
