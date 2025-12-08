export interface UseRepostInfoResult {
  /** Whether the post is a repost */
  isRepost: boolean;
  /** ID of the user who reposted */
  repostAuthorId: string | null;
  /** Whether the current user is the one who reposted */
  isCurrentUserRepost: boolean;
  /** Original post ID if this is a repost */
  originalPostId: string | null;
  /** Loading state */
  isLoading: boolean;
}
