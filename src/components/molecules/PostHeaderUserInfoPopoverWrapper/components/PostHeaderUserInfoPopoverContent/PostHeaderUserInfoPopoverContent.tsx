'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { MAX_AVATARS } from '../../PostHeaderUserInfoPopoverWrapper.constants';
import { normalizeStatsValue, transformConnectionsToAvatarItems } from '../../PostHeaderUserInfoPopoverWrapper.utils';
import type { PostHeaderUserInfoPopoverContentProps } from './PostHeaderUserInfoPopoverContent.types';
import { PostHeaderUserInfoPopoverHeader } from '../PostHeaderUserInfoPopoverHeader';
import { PostHeaderUserInfoPopoverStats } from '../PostHeaderUserInfoPopoverStats';
import { PostHeaderUserInfoPopoverFollowButton } from '../PostHeaderUserInfoPopoverFollowButton';
import { usePostHeaderUserInfoPopoverData } from '@/hooks/usePostHeaderUserInfoPopoverData';
import { usePostHeaderUserInfoPopoverActions } from '@/hooks/usePostHeaderUserInfoPopoverActions';

export function PostHeaderUserInfoPopoverContent({
  userId,
  userName,
  avatarUrl,
  formattedPublicKey,
}: PostHeaderUserInfoPopoverContentProps) {
  const {
    isCurrentUser,
    profileBio,
    profileAvatarUrl,
    followers,
    following,
    followersCount,
    followingCount,
    statsFollowers,
    statsFollowing,
    isFollowing,
    isFollowingStatusLoading,
  } = usePostHeaderUserInfoPopoverData(userId);

  const { isLoading, onEditClick, onFollowClick } = usePostHeaderUserInfoPopoverActions({
    userId,
    isCurrentUser,
    isFollowing,
    isFollowingStatusLoading,
  });

  const normalizedFollowers = normalizeStatsValue(statsFollowers, followersCount);
  const normalizedFollowing = normalizeStatsValue(statsFollowing, followingCount);

  const followersAvatars = transformConnectionsToAvatarItems(followers, MAX_AVATARS);
  const followingAvatars = transformConnectionsToAvatarItems(following, MAX_AVATARS);

  return (
    <Atoms.Container className="gap-3">
      <PostHeaderUserInfoPopoverHeader
        userName={userName}
        formattedPublicKey={formattedPublicKey}
        avatarUrl={profileAvatarUrl || avatarUrl}
      />
      {profileBio ? (
        <Atoms.Typography
          className="text-base leading-6 font-medium whitespace-pre-wrap text-secondary-foreground"
          overrideDefaults
        >
          {profileBio}
        </Atoms.Typography>
      ) : null}
      <PostHeaderUserInfoPopoverStats
        followersCount={normalizedFollowers}
        followingCount={normalizedFollowing}
        followersAvatars={followersAvatars}
        followingAvatars={followingAvatars}
        maxAvatars={MAX_AVATARS}
      />
      {isCurrentUser ? (
        <Atoms.Button variant="secondary" size="sm" onClick={onEditClick} aria-label="Edit profile">
          <Libs.Pencil className="size-4" />
          <Atoms.Typography className="text-xs leading-4 font-bold" overrideDefaults>
            Edit profile
          </Atoms.Typography>
        </Atoms.Button>
      ) : (
        <PostHeaderUserInfoPopoverFollowButton
          isFollowing={isFollowing}
          isLoading={isLoading}
          onClick={onFollowClick}
        />
      )}
    </Atoms.Container>
  );
}
