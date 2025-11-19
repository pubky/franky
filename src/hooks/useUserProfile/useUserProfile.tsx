'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

export interface UserProfile {
  name: string;
  bio: string;
  publicKey: string;
  emoji: string;
  status: string;
  avatarUrl?: string;
  link: string;
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
}

/**
 * Hook for fetching and transforming user profile data.
 * Pure data fetching - no side effects or actions.
 *
 * @param userId - The user ID to fetch profile for
 * @returns Profile data and loading state
 */
export function useUserProfile(userId: string): UseUserProfileResult {
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

  // If no user details yet, return null profile
  if (!userDetails) {
    return {
      profile: null,
      isLoading: true,
    };
  }

  const avatarUrl = userDetails.image ? Core.filesApi.getAvatar(userDetails.id) : undefined;

  // Build public key with proper format
  const publicKey = userId ? `pk:${userId}` : '';

  // Build profile link
  const link = userId ? `${window.location.origin}/profile/${userId}` : '';

  // Build profile data object
  const profile: UserProfile = {
    name: userDetails.name ?? '',
    bio: userDetails.bio ?? '',
    publicKey,
    emoji: '🌴', // Default emoji, TODO: get from user data when available
    status: userDetails.status ?? '',
    avatarUrl,
    link,
  };

  return {
    profile,
    isLoading: false,
  };
}
