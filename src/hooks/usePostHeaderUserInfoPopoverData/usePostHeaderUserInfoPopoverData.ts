'use client';

import * as Hooks from '@/hooks';
import type { UsePostHeaderUserInfoPopoverDataResult } from './usePostHeaderUserInfoPopoverData.types';

export function usePostHeaderUserInfoPopoverData(userId: string): UsePostHeaderUserInfoPopoverDataResult {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const isCurrentUser = currentUserPubky === userId;

  const { profile } = Hooks.useUserProfile(userId);
  const { stats } = Hooks.useProfileStats(userId);
  const { isFollowing, isLoading: isFollowingStatusLoading } = Hooks.useIsFollowing(userId);

  const { connections: followers, count: followersCount } = Hooks.useProfileConnections(
    Hooks.CONNECTION_TYPE.FOLLOWERS,
    userId,
  );
  const { connections: following, count: followingCount } = Hooks.useProfileConnections(
    Hooks.CONNECTION_TYPE.FOLLOWING,
    userId,
  );

  return {
    isCurrentUser,
    profileBio: profile?.bio,
    profileAvatarUrl: profile?.avatarUrl,
    followers,
    following,
    followersCount,
    followingCount,
    statsFollowers: stats.followers,
    statsFollowing: stats.following,
    isFollowing,
    isFollowingStatusLoading,
  };
}
