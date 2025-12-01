import type { Pubky } from '@/core';
import type { UserConnectionData } from '@/hooks/useProfileConnections';

export interface FollowerItemProps {
  follower: UserConnectionData;
  /** Whether the current user is following this user (reactive from database) */
  isFollowing?: boolean;
  /** Callback when follow/unfollow button is clicked */
  onFollow?: (userId: Pubky, isCurrentlyFollowing: boolean) => void;
}
