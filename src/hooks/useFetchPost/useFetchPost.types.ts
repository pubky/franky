export interface UseFetchPostResult {
  /** Function to fetch a post if it's missing */
  fetchPost: (postId: string) => Promise<void>;
  /** Whether a fetch is in progress */
  isFetching: boolean;
}
