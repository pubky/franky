export interface UseDeletePostResult {
  /** Whether deletion is in progress */
  isDeleting: boolean;
  /** Function to delete the post */
  deletePost: () => Promise<void>;
}
