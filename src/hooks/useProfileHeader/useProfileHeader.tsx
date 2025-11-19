'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/app';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

export interface ProfileStats {
  notifications: number;
  posts: number;
  replies: number;
  followers: number;
  following: number;
  friends: number;
  tagged: number;
}

export function useProfileHeader(userId: string) {
  const router = useRouter();
  const { copyToClipboard } = Hooks.useCopyToClipboard();

  // Fetch user details from local database using live query
  // This will automatically update when the database changes
  const userDetails = useLiveQuery(async () => {
    if (!userId) return null;

    // First, trigger fetch from Nexus if not in DB (non-blocking)
    // This will populate the database for subsequent queries
    Core.ProfileController.read({ userId }).catch((error) => {
      console.error('Failed to fetch user profile:', error);
    });

    // Return current value from database via controller
    return await Core.UserController.getDetails(userId);
  }, [userId]);

  // Fetch user counts from local database using live query
  const userCounts = useLiveQuery(async () => {
    if (!userId) return null;
    return await Core.UserController.getCounts(userId);
  }, [userId]);

  const avatarUrl = userDetails?.image ? Core.filesApi.getAvatar(userDetails.id) : undefined;

  // Build public key with proper format
  const publicKey = userId ? `pk:${userId}` : '';

  // Build profile link
  const link = userId ? `${window.location.origin}/profile/${userId}` : '';

  // Build profile data object
  const profile = {
    name: userDetails?.name ?? '',
    bio: userDetails?.bio ?? '',
    publicKey,
    emoji: '🌴', // Default emoji, TODO: get from user data when available
    status: userDetails?.status ?? '',
    avatarUrl,
    link,
  };

  // Build stats object from user counts
  const stats: ProfileStats = {
    notifications: 0, // TODO: Get from notifications when implemented
    posts: userCounts?.posts ?? 0,
    replies: userCounts?.replies ?? 0,
    followers: userCounts?.followers ?? 0,
    following: userCounts?.following ?? 0,
    friends: userCounts?.friends ?? 0,
    tagged: userCounts?.tagged ?? 0,
  };

  // Build actions object
  const actions = {
    onEdit: () => {
      console.log('Edit clicked');
      // TODO: Navigate to profile edit page when implemented
    },
    onCopyPublicKey: () => {
      void copyToClipboard(profile.publicKey);
    },
    onCopyLink: () => {
      void copyToClipboard(profile.link);
    },
    onSignOut: () => {
      router.push(AUTH_ROUTES.LOGOUT);
    },
    onStatusClick: () => {
      console.log('Status clicked');
      // TODO: Open status picker modal when implemented
    },
  };

  return {
    profile,
    stats,
    actions,
    isLoading: !userDetails,
  };
}
