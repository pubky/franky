/**
 * Represents a single ancestor in the post reply chain
 */
export interface Ancestor {
  /** Composite post ID in format "userId:postId" */
  postId: string;
  /** User ID of the post author */
  userId: string;
}

/**
 * Result from usePostAncestors hook
 */
export interface UsePostAncestorsResult {
  /**
   * Array of ancestors ordered from root post to current post.
   * The last item is always the current post.
   * Empty array while loading or if there's an error.
   */
  ancestors: Ancestor[];
  /** True while the ancestor chain is being fetched */
  isLoading: boolean;
  /** True if there was an error fetching the ancestor chain */
  hasError: boolean;
}
