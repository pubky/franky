export interface UseDeletePostResult {
  /** Whether deletion is in progress */
  isDeleting: boolean;
  /** Function to delete the post; defaults to the hook's postId if not provided */
  deletePost: (targetPostId?: string) => Promise<void>;
}
