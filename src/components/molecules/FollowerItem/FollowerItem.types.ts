import type { Pubky } from '@/core';
import type { UserConnectionData } from '@/hooks/useProfileConnections';

export interface FollowerItemProps {
  follower: UserConnectionData;
  isFollowing?: boolean;
  onFollow?: (followerId: Pubky) => void;
}
