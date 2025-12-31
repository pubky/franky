'use client';

import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { POST_ROUTES } from '@/app/routes';
import { POST_MENU_ACTION_IDS, POST_MENU_ACTION_VARIANTS } from './usePostMenuActions.constants';
import type { UsePostMenuActionsResult, PostMenuActionItem } from './usePostMenuActions.types';

/**
 * usePostMenuActions
 *
 * Hook for generating menu items for post actions menu.
 * Returns a list of menu items based on post ownership, post type, and user relationships.
 * Handles follow/unfollow, copy actions (pubky, link, text), mute (disabled), report, and delete.
 *
 * @param postId - Composite post ID in format "author:postId"
 * @returns Menu items array and loading state
 */
export function usePostMenuActions(postId: string): UsePostMenuActionsResult {
  const parsedId = Core.parseCompositeId(postId);
  const postAuthorId = parsedId.pubky;

  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { postDetails, isLoading: isPostLoading } = Hooks.usePostDetails(postId);
  const { profile: authorProfile, isLoading: isAuthorLoading } = Hooks.useUserProfile(postAuthorId);
  const { isFollowing, isLoading: isFollowingLoading } = Hooks.useIsFollowing(postAuthorId);

  const { toggleFollow, isLoading: isFollowLoading, isUserLoading } = Hooks.useFollowUser();
  const { deletePost, isDeleting } = Hooks.useDeletePost(postId);
  const { copyToClipboard: copyPubky } = Hooks.useCopyToClipboard({
    successTitle: 'Pubky copied to clipboard',
  });
  const { copyToClipboard: copyLink } = Hooks.useCopyToClipboard({
    successTitle: 'Link copied to clipboard',
  });
  const { copyToClipboard: copyText } = Hooks.useCopyToClipboard({
    successTitle: 'Text copied to clipboard',
  });

  const isOwnPost = currentUserPubky === postAuthorId;
  const username = authorProfile?.name || postAuthorId;
  const isArticle = postDetails?.kind === 'long';
  const isLoading = isPostLoading || isAuthorLoading || isFollowingLoading;
  const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${POST_ROUTES.POST}/${parsedId.pubky}/${parsedId.id}`;

  const menuItems: PostMenuActionItem[] = [];

  if (!isOwnPost) {
    menuItems.push({
      id: POST_MENU_ACTION_IDS.FOLLOW,
      label: isFollowing ? `Unfollow ${username}` : `Follow ${username}`,
      icon: isFollowing ? Libs.UserRoundMinus : Libs.UserRoundPlus,
      onClick: async () => {
        try {
          await toggleFollow(postAuthorId, isFollowing);
        } catch (error) {
          Molecules.toast({
            title: 'Error',
            description: Libs.isAppError(error) ? error.message : 'Failed to update follow status',
          });
        }
      },
      variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
      disabled: isFollowLoading || isUserLoading(postAuthorId),
    });
  }

  menuItems.push({
    id: POST_MENU_ACTION_IDS.COPY_PUBKY,
    label: 'Copy pubky',
    icon: Libs.Key,
    onClick: () => void copyPubky(postAuthorId),
    variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
  });

  menuItems.push({
    id: POST_MENU_ACTION_IDS.COPY_LINK,
    label: 'Copy link to post',
    icon: Libs.Link,
    onClick: () => void copyLink(postUrl),
    variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
  });

  if (!isArticle) {
    menuItems.push({
      id: POST_MENU_ACTION_IDS.COPY_TEXT,
      label: 'Copy text of post',
      icon: Libs.FileText,
      onClick: () => void copyText(postDetails?.content ?? ''),
      variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
    });
  }

  if (!isOwnPost) {
    menuItems.push({
      id: POST_MENU_ACTION_IDS.MUTE,
      label: `Mute ${username}`,
      icon: Libs.MegaphoneOff,
      onClick: () => {},
      variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
      disabled: true,
    });

    menuItems.push({
      id: POST_MENU_ACTION_IDS.REPORT,
      label: 'Report post',
      icon: Libs.Flag,
      onClick: () => {
        Molecules.toast({
          title: 'Report',
          description: 'Report functionality coming soon',
        });
      },
      variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
    });
  }

  if (isOwnPost) {
    menuItems.push({
      id: POST_MENU_ACTION_IDS.DELETE,
      label: 'Delete post',
      icon: Libs.Trash,
      onClick: deletePost,
      variant: POST_MENU_ACTION_VARIANTS.DESTRUCTIVE,
      disabled: isDeleting,
    });
  }

  return {
    menuItems,
    isLoading,
  };
}
