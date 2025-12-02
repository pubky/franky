/**
 * Result of the useIsFollowing hook
 */
export interface UseIsFollowingResult {
  /** Whether the current user is following the target user */
  isFollowing: boolean;
  /** Whether the relationship data is still loading */
  isLoading: boolean;
}
