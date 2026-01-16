'use client';

import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Config from '@/config';
import * as Libs from '@/libs';

export interface UserProfile {
  name: string;
  bio: string;
  publicKey: string;
  emoji: string;
  status: string;
  avatarUrl?: string;
  link: string;
  /** User's external links (social media, websites, etc.) */
  links?: Core.NexusUserLink[] | null;
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
}

/**
 * Hook for fetching and transforming user profile data.
 * Pure data fetching - no side effects or actions.
 *
 * Separates concerns:
 * 1. useEffect: Ensures data exists (fetch from Nexus if missing)
 * 2. useLiveQuery: Reads current data reactively from local DB
 *
 * @param userId - The user ID to fetch profile for
 * @returns Profile data and loading state
 */
export function useUserProfile(userId: string): UseUserProfileResult {
  // Separate concern: Ensure data exists (fetch-if-missing)
  // This runs once per userId and triggers ProfileApplication.read
  // which handles the cache-or-fetch logic internally
  useEffect(() => {
    if (!userId) return;

    // ProfileApplication.read handles the caching strategy:
    // 1. Check local DB first
    // 2. If missing, fetch from Nexus
    // 3. Write to local DB
    // 4. Return data
    Core.UserController.getOrFetchDetails({ userId }).catch((error) => {
      console.error('Failed to fetch user profile:', error);
    });
  }, [userId]);

  // Separate concern: Read current data from local database
  // This will reactively update when the database changes
  const userDetails = useLiveQuery(async () => {
    if (!userId) return null;
    return await Core.UserController.getDetails({ userId });
  }, [userId]);

  // Distinguish between:
  // - undefined: query hasn't run yet → loading
  // - null: query ran but user not found → loaded, no data
  // - object: query ran and found user → loaded with data
  if (userDetails === undefined) {
    return {
      profile: null,
      isLoading: true,
    };
  }

  // User not found (null) or empty - return default profile but mark as loaded
  if (!userDetails) {
    return {
      profile: null,
      isLoading: false,
    };
  }

  const avatarUrl = userDetails.image
    ? Core.FileController.getAvatarUrl(userDetails.id, userDetails.indexed_at)
    : undefined;

  // Build public key with proper format
  const publicKey = userId ? Libs.withPubkyPrefix(userId) : '';

  // Build profile link using config (SSR-safe)
  // Use DEFAULT_URL from config to avoid window.location.origin which breaks SSR
  const link = userId ? `${Config.DEFAULT_URL}/profile/${userId}` : '';

  // Build profile data object
  const profile: UserProfile = {
    name: userDetails.name ?? '',
    bio: userDetails.bio ?? '',
    publicKey,
    emoji: '🌴', // Default emoji, TODO: get from user data when available
    status: userDetails.status ?? '',
    avatarUrl,
    link,
    links: userDetails.links,
  };

  return {
    profile,
    isLoading: false,
  };
}
