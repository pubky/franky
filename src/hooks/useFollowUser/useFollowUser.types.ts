import type { Pubky } from '@/core';

export interface UseFollowUserResult {
  /** Toggles follow status for a user */
  toggleFollow: (userId: Pubky, isCurrentlyFollowing: boolean) => Promise<void>;
  /** Whether a follow/unfollow action is in progress */
  isLoading: boolean;
  /** Error message if the action failed */
  error: string | null;
}
