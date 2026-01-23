'use client';

import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { PROFILE_ROUTES } from '@/app/routes';
import { PROFILE_MENU_ACTION_IDS } from './useProfileMenuActions.constants';
import type { UseProfileMenuActionsResult, ProfileMenuActionItem } from './useProfileMenuActions.types';

/**
 * useProfileMenuActions
 *
 * Hook for generating menu items for profile actions menu.
 * Returns a list of menu items based on user relationships.
 * Handles follow/unfollow, copy actions (pubky, profile link), and mute.
 *
 * @param userId - The public key of the profile user
 * @returns Menu items array and loading state
 */
export function useProfileMenuActions(userId: string): UseProfileMenuActionsResult {
  const { profile, isLoading: isProfileLoading } = Hooks.useUserProfile(userId);
  const { isFollowing, isLoading: isFollowingLoading } = Hooks.useIsFollowing(userId);

  const { toggleFollow, isLoading: isFollowLoading, isUserLoading } = Hooks.useFollowUser();
  const { toggleMute, isLoading: isMuteLoading, isUserLoading: isMuteUserLoading } = Hooks.useMuteUser();
  const { isMuted } = Hooks.useMutedUsers();
  const { copyToClipboard: copyPubky } = Hooks.useCopyToClipboard({
    successTitle: 'Pubky copied to clipboard',
  });
  const { copyToClipboard: copyLink } = Hooks.useCopyToClipboard({
    successTitle: 'Profile link copied to clipboard',
  });

  const isUserMuted = isMuted(userId);
  const rawUsername = profile?.name || userId;
  const username = Libs.truncateString(rawUsername, 15);
  const isLoading = isProfileLoading || isFollowingLoading;
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${PROFILE_ROUTES.PROFILE}/${userId}`;

  const menuItems: ProfileMenuActionItem[] = [];

  // Follow/Unfollow
  menuItems.push({
    id: PROFILE_MENU_ACTION_IDS.FOLLOW,
    label: isFollowing ? `Unfollow ${username}` : `Follow ${username}`,
    icon: isFollowing ? Libs.UserRoundMinus : Libs.UserRoundPlus,
    onClick: async () => {
      try {
        await toggleFollow(userId, isFollowing);
      } catch (error) {
        Molecules.toast({
          title: 'Error',
          description: Libs.isAppError(error) ? error.message : 'Failed to update follow status',
        });
      }
    },
    disabled: isFollowLoading || isUserLoading(userId),
  });

  // Copy pubky
  menuItems.push({
    id: PROFILE_MENU_ACTION_IDS.COPY_PUBKY,
    label: 'Copy user pubky',
    icon: Libs.Key,
    onClick: async () => {
      try {
        await copyPubky(Libs.withPubkyPrefix(userId));
      } catch (error) {
        Molecules.toast({
          title: 'Error',
          description: Libs.isAppError(error) ? error.message : 'Failed to copy pubky',
        });
      }
    },
  });

  // Copy profile link
  menuItems.push({
    id: PROFILE_MENU_ACTION_IDS.COPY_LINK,
    label: 'Copy profile link',
    icon: Libs.Link,
    onClick: async () => {
      try {
        await copyLink(profileUrl);
      } catch (error) {
        Molecules.toast({
          title: 'Error',
          description: Libs.isAppError(error) ? error.message : 'Failed to copy link',
        });
      }
    },
  });

  // Mute/Unmute
  menuItems.push({
    id: PROFILE_MENU_ACTION_IDS.MUTE,
    label: `${isUserMuted ? 'Unmute' : 'Mute'} ${username}`,
    icon: isUserMuted ? Libs.Megaphone : Libs.MegaphoneOff,
    onClick: async () => {
      try {
        await toggleMute(userId, isUserMuted);
        Molecules.toast({
          title: isUserMuted ? 'User unmuted' : 'User muted',
          description: `${username} has been ${isUserMuted ? 'unmuted' : 'muted'}.`,
        });
      } catch (error) {
        Molecules.toast({
          title: 'Error',
          description: Libs.isAppError(error) ? error.message : 'Failed to update mute status',
        });
      }
    },
    disabled: isMuteLoading || isMuteUserLoading(userId),
  });

  return {
    menuItems,
    isLoading,
  };
}
