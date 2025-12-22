'use client';

import { useMemo, useCallback } from 'react';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { POST_ROUTES } from '@/app/routes';
import {
  POST_MENU_ACTION_IDS,
  POST_MENU_ACTION_VARIANTS,
  type UsePostMenuActionsResult,
  type PostMenuActionItem,
} from './usePostMenuActions.constants';

/**
 * usePostMenuActions
 *
 * Hook that provides menu items and action handlers for post menu actions.
 * Handles follow/unfollow, mute, delete, copy actions, and report.
 *
 * @param postId - Composite post ID in format "authorId:postId"
 * @returns Menu items configuration and loading state
 */
export function usePostMenuActions(postId: string): UsePostMenuActionsResult {
  const { postDetails, isLoading: isPostLoading } = Hooks.usePostDetails(postId);
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
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

  // Parse post ID to get author
  const parsedId = Core.parseCompositeId(postId);
  const postAuthorId = parsedId.pubky;
  const isOwnPost = currentUserPubky === postAuthorId;

  // Check mute status (only if not own post)
  const {
    toggleMute,
    isMuted,
    isLoading: isMuteLoading,
    isMutedLoading,
    isUserLoading: isMuteUserLoading,
  } = Hooks.useMuteUser(postAuthorId);

  // Get author profile
  const { profile: authorProfile, isLoading: isAuthorLoading } = Hooks.useUserProfile(postAuthorId);

  // Check if following
  const { isFollowing, isLoading: isFollowingLoading } = Hooks.useIsFollowing(postAuthorId);

  // Get username (fallback to pubky)
  const username = authorProfile?.name || postAuthorId;

  // Check if article
  const isArticle = postDetails?.kind === 'long';

  const isLoading = isPostLoading || isAuthorLoading || isFollowingLoading || isMutedLoading;

  // Handle follow/unfollow
  const handleFollow = useCallback(async () => {
    if (!currentUserPubky || isOwnPost) return;
    try {
      await toggleFollow(postAuthorId, isFollowing);
    } catch (error) {
      Libs.Logger.error('[usePostMenuActions] Failed to toggle follow:', error);
      Molecules.toast({
        title: 'Error',
        description: Libs.isAppError(error) ? error.message : 'Failed to update follow status',
      });
    }
  }, [currentUserPubky, isOwnPost, postAuthorId, isFollowing, toggleFollow]);

  // Handle mute
  const handleMute = useCallback(async () => {
    if (!currentUserPubky || isMuted === undefined) return;
    try {
      await toggleMute(postAuthorId, isMuted);
      Molecules.toast({
        title: isMuted ? 'User unmuted' : 'User muted',
        description: isMuted
          ? `You will now see posts from ${username}`
          : `You will no longer see posts from ${username}`,
      });
    } catch (error) {
      Libs.Logger.error('[usePostMenuActions] Failed to toggle mute:', error);
      Molecules.toast({
        title: 'Error',
        description: Libs.isAppError(error) ? error.message : 'Failed to update mute status',
      });
    }
  }, [currentUserPubky, postAuthorId, isMuted, username, toggleMute]);

  // Handle copy pubky
  const handleCopyPubky = useCallback(async () => {
    try {
      await copyPubky(postAuthorId);
    } catch (error) {
      Libs.Logger.error('[usePostMenuActions] Failed to copy pubky:', error);
    }
  }, [postAuthorId, copyPubky]);

  // Handle copy link
  const handleCopyLink = useCallback(async () => {
    try {
      const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${POST_ROUTES.POST}/${parsedId.pubky}/${parsedId.id}`;
      await copyLink(postUrl);
    } catch (error) {
      Libs.Logger.error('[usePostMenuActions] Failed to copy link:', error);
    }
  }, [parsedId.pubky, parsedId.id, copyLink]);

  // Handle copy text
  const handleCopyText = useCallback(async () => {
    try {
      const text = postDetails?.content ?? '';
      await copyText(text);
    } catch (error) {
      Libs.Logger.error('[usePostMenuActions] Failed to copy text:', error);
    }
  }, [postDetails, copyText]);

  // Handle report (placeholder)
  const handleReport = useCallback(() => {
    // TODO: Implement report functionality
    Molecules.toast({
      title: 'Report',
      description: 'Report functionality coming soon',
    });
  }, []);

  // Build menu items
  const menuItems = useMemo<PostMenuActionItem[]>(() => {
    const items: PostMenuActionItem[] = [];

    if (!isOwnPost) {
      // Other user's post: Follow/Unfollow
      items.push({
        id: POST_MENU_ACTION_IDS.FOLLOW,
        label: isFollowing ? `Unfollow ${username}` : `Follow ${username}`,
        icon: isFollowing ? Libs.UserRoundMinus : Libs.UserRoundPlus,
        onClick: handleFollow,
        variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
        disabled: isFollowLoading || isUserLoading(postAuthorId),
      });
    }

    // Common options for both own and other user's posts
    // Copy pubky
    items.push({
      id: POST_MENU_ACTION_IDS.COPY_PUBKY,
      label: 'Copy pubky',
      icon: Libs.Key,
      onClick: handleCopyPubky,
      variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
    });

    // Copy link
    items.push({
      id: POST_MENU_ACTION_IDS.COPY_LINK,
      label: 'Copy link to post',
      icon: Libs.Link,
      onClick: handleCopyLink,
      variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
    });

    // Copy text (only if not article)
    if (!isArticle) {
      items.push({
        id: POST_MENU_ACTION_IDS.COPY_TEXT,
        label: 'Copy text of post',
        icon: Libs.FileText,
        onClick: handleCopyText,
        variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
      });
    }

    if (!isOwnPost) {
      // Mute user (only for other user's posts)
      items.push({
        id: POST_MENU_ACTION_IDS.MUTE,
        label: isMuted ? `Unmute ${username}` : `Mute ${username}`,
        icon: Libs.MegaphoneOff,
        onClick: handleMute,
        variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
        disabled: isMuteLoading || isMuteUserLoading(postAuthorId) || isMuted === undefined,
      });

      // Report post (only for other user's posts)
      items.push({
        id: POST_MENU_ACTION_IDS.REPORT,
        label: 'Report post',
        icon: Libs.Flag,
        onClick: handleReport,
        variant: POST_MENU_ACTION_VARIANTS.DEFAULT,
      });
    }

    // Delete (only for own posts, at the end)
    if (isOwnPost) {
      items.push({
        id: POST_MENU_ACTION_IDS.DELETE,
        label: 'Delete post',
        icon: Libs.Trash,
        onClick: deletePost,
        variant: POST_MENU_ACTION_VARIANTS.DESTRUCTIVE,
        disabled: isDeleting,
      });
    }

    return items;
  }, [
    isOwnPost,
    isFollowing,
    username,
    handleFollow,
    isFollowLoading,
    isUserLoading,
    postAuthorId,
    handleCopyPubky,
    handleCopyLink,
    isArticle,
    handleCopyText,
    isMuted,
    handleMute,
    isMuteLoading,
    isMuteUserLoading,
    handleReport,
    deletePost,
    isDeleting,
  ]);

  return {
    menuItems,
    isLoading,
  };
}
