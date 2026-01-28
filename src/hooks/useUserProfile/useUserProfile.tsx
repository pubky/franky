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
 * 1. useEffect: Ensures data exists in local DB (fetch if missing)
 * 2. useLiveQuery: Reads current data reactively from local DB
 *
 * Note: Data freshness is managed by TTL Coordinator via useTtlSubscription
 * in the consuming component (e.g., ProfilePageHeader)
 *
 * @param userId - The user ID to fetch profile for
 * @returns Profile data and loading state
 */
export function useUserProfile(userId: string): UseUserProfileResult {
  // Separate concern: Fetch data if not in local database
  // Uses getOrFetch pattern per ADR-0001 (local-first)
  useEffect(() => {
    if (!userId) return;

    // Fetch details if not cached (local-first pattern)
    // Freshness is managed by TTL Coordinator in ProfilePageHeader
    Core.UserController.getOrFetchDetails({ userId }).catch((error) => {
      Libs.Logger.error('[useUserProfile] Failed to fetch user profile', { userId, error });
    });
  }, [userId]);

  // Separate concern: Read current data from local database
  // This will reactively update when the database changes (e.g., after TTL refresh)
  const userDetails = useLiveQuery(async () => {
    try {
      if (!userId) return null;
      return await Core.UserController.getDetails({ userId });
    } catch (error) {
      Libs.Logger.error('[useUserProfile] Failed to query user details', { userId, error });
      return null;
    }
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
