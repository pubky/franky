'use client';

import * as React from 'react';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { POST_ROUTES } from '@/app/routes';

export interface PostMenuActionItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  show: boolean;
}

export interface UsePostMenuActionsResult {
  menuItems: PostMenuActionItem[];
  isLoading: boolean;
}

/**
 * usePostMenuActions
 *
 * Hook that provides all data and handlers for post menu actions.
 * Handles follow, mute, copy, delete operations with toast notifications.
 *
 * @param postId - Composite post ID in format "authorId:postId"
 * @param onClose - Callback to close the menu after action
 * @returns Menu items array and loading state
 */
export function usePostMenuActions(postId: string, onClose?: () => void): UsePostMenuActionsResult {
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { postDetails } = Hooks.usePostDetails(postId);

  // Extract author ID from postId
  const authorId = React.useMemo(() => {
    try {
      return Core.parseCompositeId(postId).pubky;
    } catch {
      return null;
    }
  }, [postId]);

  const { userDetails } = Hooks.useUserDetails(authorId || '');

  // Check if post is owned by current user
  const isOwnPost = React.useMemo(() => {
    if (!currentUserPubky || !authorId) return false;
    return authorId === currentUserPubky;
  }, [currentUserPubky, authorId]);

  // Check if post is an article (long post)
  const isArticle = React.useMemo(() => {
    if (!postDetails) return false;
    return postDetails.kind === 'long';
  }, [postDetails]);

  // Follow hooks
  const { isFollowing } = Hooks.useIsFollowing(isOwnPost ? '' : authorId || '');
  const { toggleFollow, isUserLoading: isFollowUserLoading } = Hooks.useFollowUser();

  // Mute hooks
  const {
    isMuted,
    toggleMute,
    isUserLoading: isMuteUserLoading,
  } = Hooks.useMuteUser(isOwnPost ? undefined : authorId || undefined);

  // Copy hook
  const { copyToClipboard } = Hooks.useCopyToClipboard({
    successTitle: 'Copied to clipboard',
  });

  // Get post URL
  const getPostUrl = React.useCallback(() => {
    try {
      const { pubky: userId, id: postIdPart } = Core.parseCompositeId(postId);
      return `${POST_ROUTES.POST}/${userId}/${postIdPart}`;
    } catch {
      return '';
    }
  }, [postId]);

  // Handlers
  const handleFollow = React.useCallback(async () => {
    if (!authorId) return;
    try {
      await toggleFollow(authorId, isFollowing);
      Molecules.toast({
        title: isFollowing ? 'Unfollowed' : 'Following',
        description: `You ${isFollowing ? 'unfollowed' : 'are now following'} ${userDetails?.name || ''}`,
      });
      onClose?.();
    } catch (error) {
      Libs.Logger.error('[PostMenuActions] Failed to toggle follow:', error);
      Molecules.toast({
        title: 'Error',
        description: 'Failed to update follow status',
      });
    }
  }, [authorId, isFollowing, toggleFollow, userDetails, onClose]);

  const handleMute = React.useCallback(async () => {
    if (!authorId) return;
    try {
      await toggleMute(authorId, isMuted);
      Molecules.toast({
        title: isMuted ? 'Unmuted' : 'Muted',
        description: `You ${isMuted ? 'unmuted' : 'muted'} ${userDetails?.name || ''}`,
      });
      onClose?.();
    } catch (error) {
      Libs.Logger.error('[PostMenuActions] Failed to toggle mute:', error);
      Molecules.toast({
        title: 'Error',
        description: 'Failed to update mute status',
      });
    }
  }, [authorId, isMuted, toggleMute, userDetails, onClose]);

  const handleCopyPubky = React.useCallback(async () => {
    if (!authorId) return;
    const success = await copyToClipboard(authorId);
    if (success) {
      onClose?.();
    }
  }, [authorId, copyToClipboard, onClose]);

  const handleCopyLink = React.useCallback(async () => {
    const url = getPostUrl();
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
    const success = await copyToClipboard(fullUrl);
    if (success) {
      onClose?.();
    }
  }, [getPostUrl, copyToClipboard, onClose]);

  const handleCopyText = React.useCallback(async () => {
    if (!postDetails?.content) return;
    const success = await copyToClipboard(postDetails.content);
    if (success) {
      onClose?.();
    }
  }, [postDetails, copyToClipboard, onClose]);

  const handleDelete = React.useCallback(async () => {
    if (!isOwnPost) return;
    try {
      await Core.PostController.delete({ compositePostId: postId });
      Molecules.toast({
        title: 'Post deleted',
        description: 'Your post has been deleted',
      });
      onClose?.();
    } catch (error) {
      Libs.Logger.error('[PostMenuActions] Failed to delete post:', error);
      Molecules.toast({
        title: 'Error',
        description: 'Failed to delete post',
      });
    }
  }, [postId, isOwnPost, onClose]);

  const handleEdit = React.useCallback(() => {
    // TODO: Implement edit post functionality
    console.log('[PostMenuActions] Edit post clicked', { postId });
    onClose?.();
  }, [postId, onClose]);

  const handleReport = React.useCallback(() => {
    // TODO: Implement report post functionality
    console.log('[PostMenuActions] Report post clicked', { postId });
    onClose?.();
  }, [postId, onClose]);

  const isLoading = !authorId || !userDetails;

  // Build menu items - must be called unconditionally but returns empty if loading
  const menuItems = React.useMemo<PostMenuActionItem[]>(() => {
    if (isLoading || !authorId) return [];

    const isFollowLoading = isFollowUserLoading(authorId);
    const isMuteLoading = isMuteUserLoading(authorId);

    return [
      {
        id: 'follow',
        icon: isFollowing ? Libs.UserMinus : Libs.UserPlus,
        label: `${isFollowing ? 'Unfollow' : 'Follow'} ${userDetails?.name || ''}`,
        onClick: handleFollow,
        disabled: isFollowLoading,
        show: !isOwnPost,
      },
      {
        id: 'edit',
        icon: Libs.Pencil,
        label: isArticle ? 'Edit article' : 'Edit post',
        onClick: handleEdit,
        disabled: true,
        show: isOwnPost,
      },
      {
        id: 'copy-pubky',
        icon: Libs.KeyRound,
        label: 'Copy user pubky',
        onClick: handleCopyPubky,
        show: true,
      },
      {
        id: 'copy-link',
        icon: Libs.Link,
        label: 'Copy link to post',
        onClick: handleCopyLink,
        show: true,
      },
      {
        id: 'copy-text',
        icon: Libs.FileText,
        label: 'Copy text of post',
        onClick: handleCopyText,
        show: !isArticle,
      },
      {
        id: 'mute',
        icon: Libs.MegaphoneOff,
        label: isMuted ? 'Unmute user' : 'Mute user',
        onClick: handleMute,
        disabled: isMuteLoading,
        show: !isOwnPost,
      },
      {
        id: 'delete',
        icon: Libs.Trash,
        label: 'Delete post',
        onClick: handleDelete,
        destructive: true,
        show: isOwnPost,
      },
      {
        id: 'report',
        icon: Libs.Flag,
        label: 'Report post',
        onClick: handleReport,
        disabled: true,
        show: !isOwnPost,
      },
    ].filter((item) => item.show);
  }, [
    isLoading,
    authorId,
    userDetails,
    isOwnPost,
    isArticle,
    isFollowing,
    isMuted,
    isFollowUserLoading,
    isMuteUserLoading,
    handleFollow,
    handleMute,
    handleCopyPubky,
    handleCopyLink,
    handleCopyText,
    handleDelete,
    handleEdit,
    handleReport,
  ]);

  return {
    menuItems,
    isLoading,
  };
}
