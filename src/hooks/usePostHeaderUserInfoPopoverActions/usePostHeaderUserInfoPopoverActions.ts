'use client';

import { useRouter } from 'next/navigation';
import * as App from '@/app';
import * as Hooks from '@/hooks';
import type { UsePostHeaderUserInfoPopoverActionsResult } from './usePostHeaderUserInfoPopoverActions.types';

export function usePostHeaderUserInfoPopoverActions({
  userId,
  isCurrentUser,
  isFollowing,
  isFollowingStatusLoading,
}: {
  userId: string;
  isCurrentUser: boolean;
  isFollowing: boolean;
  isFollowingStatusLoading: boolean;
}): UsePostHeaderUserInfoPopoverActionsResult {
  const router = useRouter();
  const { toggleFollow, isUserLoading } = Hooks.useFollowUser();

  const isLoading = isUserLoading(userId) || isFollowingStatusLoading;

  const onEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(App.SETTINGS_ROUTES.EDIT);
  };

  const onFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrentUser) return;
    await toggleFollow(userId, isFollowing);
  };

  return { isLoading, onEditClick, onFollowClick };
}
