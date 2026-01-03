import type { UserConnectionData } from '@/hooks/useProfileConnections/useProfileConnections.types';

export interface UsePostHeaderUserInfoPopoverDataResult {
  isCurrentUser: boolean;
  isLoading: boolean;
  profileBio?: string;
  profileAvatarUrl?: string;
  followers: UserConnectionData[];
  following: UserConnectionData[];
  followersCount: number;
  followingCount: number;
  statsFollowers: number;
  statsFollowing: number;
  isFollowing: boolean;
  isFollowingStatusLoading: boolean;
}
