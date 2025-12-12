export interface UseDeletePostResult {
  /** Whether deletion is in progress */
  isDeleting: boolean;
  /** Deletes the post passed to `useDeletePost(postId)` */
  deletePost: () => Promise<void>;
}
