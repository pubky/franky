'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as App from '@/app';
import type { PostHeaderUserInfoPopoverWrapperProps } from './PostHeaderUserInfoPopoverWrapper.types';
import { transformConnectionsToAvatarItems, normalizeStatsValue } from './PostHeaderUserInfoPopoverWrapper.utils';
import { MAX_AVATARS, POPOVER_ALIGN_OFFSET, POPOVER_SIDE_OFFSET } from './PostHeaderUserInfoPopoverWrapper.constants';

export function PostHeaderUserInfoPopoverWrapper({
  userId,
  userName,
  avatarUrl,
  formattedPublicKey,
  children,
}: PostHeaderUserInfoPopoverWrapperProps) {
  const router = useRouter();
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { profile } = Hooks.useUserProfile(userId);
  const { isFollowing, isLoading: isFollowingStatusLoading } = Hooks.useIsFollowing(userId);
  const { toggleFollow, isUserLoading } = Hooks.useFollowUser();
  const { stats } = Hooks.useProfileStats(userId);

  // Fetch followers and following for avatar groups
  const { connections: followers, count: followersCount } = Hooks.useProfileConnections(
    Hooks.CONNECTION_TYPE.FOLLOWERS,
    userId,
  );
  const { connections: following, count: followingCount } = Hooks.useProfileConnections(
    Hooks.CONNECTION_TYPE.FOLLOWING,
    userId,
  );

  const isCurrentUser = currentUserPubky === userId;
  const showLoading = useMemo(
    () => isUserLoading(userId) || isFollowingStatusLoading,
    [isUserLoading, userId, isFollowingStatusLoading],
  );

  // Normalize stats to handle NaN and ensure valid numbers
  // Use connections count as fallback if stats are 0 but connections exist (edge case)
  const normalizedFollowers = useMemo(
    () => normalizeStatsValue(stats.followers, followersCount),
    [stats.followers, followersCount],
  );

  const normalizedFollowing = useMemo(
    () => normalizeStatsValue(stats.following, followingCount),
    [stats.following, followingCount],
  );

  // Transform connections to avatar items
  const followersAvatars = useMemo(() => transformConnectionsToAvatarItems(followers, MAX_AVATARS), [followers]);
  const followingAvatars = useMemo(() => transformConnectionsToAvatarItems(following, MAX_AVATARS), [following]);

  // Event handlers
  const handleFollowClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isCurrentUser) {
        await toggleFollow(userId, isFollowing);
      }
    },
    [isCurrentUser, toggleFollow, userId, isFollowing],
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(App.SETTINGS_ROUTES.EDIT);
    },
    [router],
  );

  return (
    <Atoms.Popover hover>
      <Atoms.PopoverTrigger asChild>{children}</Atoms.PopoverTrigger>
      <Atoms.PopoverContent
        side="top"
        sideOffset={POPOVER_SIDE_OFFSET}
        align="start"
        alignOffset={POPOVER_ALIGN_OFFSET}
        className="mx-0 w-(--popover-width) p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Atoms.Container className="gap-3">
          {/* User Info Section */}
          <Atoms.Container className="flex min-w-0 items-center gap-2" overrideDefaults>
            <Molecules.AvatarWithFallback avatarUrl={profile?.avatarUrl || avatarUrl} name={userName} size="md" />
            <Atoms.Container className="min-w-0 flex-1 items-start">
              <Atoms.Typography className="truncate text-sm leading-5 font-bold whitespace-nowrap" overrideDefaults>
                {userName}
              </Atoms.Typography>
              <Atoms.Typography
                className="text-xs leading-4 font-medium tracking-[1.2px] whitespace-pre-wrap text-muted-foreground uppercase"
                overrideDefaults
              >
                {formattedPublicKey}
              </Atoms.Typography>
            </Atoms.Container>
          </Atoms.Container>

          {/* Bio Section */}
          {profile?.bio && (
            <Atoms.Typography
              className="text-base leading-6 font-medium whitespace-pre-wrap text-secondary-foreground"
              overrideDefaults
            >
              {profile.bio}
            </Atoms.Typography>
          )}

          {/* Stats Section */}
          <Atoms.Container className="flex items-start gap-2.5" overrideDefaults>
            {/* Followers Column */}
            <Atoms.Container className="flex-1 items-start gap-2">
              <Atoms.Typography
                className="text-xs leading-4 font-medium tracking-[1.2px] whitespace-pre-wrap text-muted-foreground uppercase"
                overrideDefaults
              >
                <Atoms.Typography as="span" className="text-white" overrideDefaults>
                  {normalizedFollowers}
                </Atoms.Typography>{' '}
                FOLLOWERS
              </Atoms.Typography>
              {followersAvatars.length > 0 && (
                <Molecules.AvatarGroup
                  items={followersAvatars}
                  totalCount={normalizedFollowers}
                  maxAvatars={MAX_AVATARS}
                />
              )}
            </Atoms.Container>

            {/* Following Column */}
            <Atoms.Container className="flex-1 items-start gap-2">
              <Atoms.Typography
                className="text-xs leading-4 font-medium tracking-[1.2px] whitespace-pre-wrap text-muted-foreground uppercase"
                overrideDefaults
              >
                <Atoms.Typography as="span" className="text-white" overrideDefaults>
                  {normalizedFollowing}
                </Atoms.Typography>{' '}
                FOLLOWING
              </Atoms.Typography>
              {followingAvatars.length > 0 && (
                <Molecules.AvatarGroup
                  items={followingAvatars}
                  totalCount={normalizedFollowing}
                  maxAvatars={MAX_AVATARS}
                />
              )}
            </Atoms.Container>
          </Atoms.Container>

          {/* Action Button Section */}
          {isCurrentUser ? (
            <Atoms.Button variant="secondary" size="sm" onClick={handleEditClick} aria-label="Edit profile">
              <Libs.Pencil className="size-4" />
              <Atoms.Typography className="text-xs leading-4 font-bold" overrideDefaults>
                Edit profile
              </Atoms.Typography>
            </Atoms.Button>
          ) : (
            <Atoms.Button
              variant="secondary"
              size="sm"
              onClick={handleFollowClick}
              disabled={showLoading}
              aria-label={isFollowing ? 'Unfollow' : 'Follow'}
            >
              {showLoading ? (
                <Libs.Loader2 className="size-4 animate-spin" />
              ) : isFollowing ? (
                <>
                  <Libs.Check className="size-4 group-hover:hidden" />
                  <Atoms.Typography className="text-xs leading-4 font-bold group-hover:hidden" overrideDefaults>
                    Following
                  </Atoms.Typography>
                  <Libs.UserMinus className="hidden size-4 group-hover:block" />
                  <Atoms.Typography className="hidden text-xs leading-4 font-bold group-hover:block" overrideDefaults>
                    Unfollow
                  </Atoms.Typography>
                </>
              ) : (
                <>
                  <Libs.UserRoundPlus className="size-4" />
                  <Atoms.Typography className="text-xs leading-4 font-bold" overrideDefaults>
                    Follow
                  </Atoms.Typography>
                </>
              )}
            </Atoms.Button>
          )}
        </Atoms.Container>
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
