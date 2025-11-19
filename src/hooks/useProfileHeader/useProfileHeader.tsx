'use client';

import * as Hooks from '@/hooks';

// Re-export types from composed hooks for backwards compatibility
export type { ProfileStats } from '@/hooks/useProfileStats';
export type { UserProfile } from '@/hooks/useUserProfile';
export type { ProfileActions } from '@/hooks/useProfileActions';

/**
 * Default profile data used during loading state or when profile is unavailable.
 */
const DEFAULT_PROFILE: Hooks.UserProfile = {
  name: '',
  bio: '',
  publicKey: '',
  emoji: '🌴',
  status: '',
  avatarUrl: undefined,
  link: '',
};

/**
 * Composite hook that combines user profile data, stats, and actions.
 * This hook composes three focused hooks following Single Responsibility Principle:
 *
 * - useUserProfile: Pure data fetching for user details
 * - useProfileStats: Pure data fetching for statistics
 * - useProfileActions: Action handlers for user interactions
 *
 * Note: This hook guarantees a non-null profile object by providing default values
 * during loading state. Consumers should check `isLoading` to determine data readiness.
 *
 * @param userId - The user ID to fetch profile data for
 * @returns Combined profile data (never null), stats, actions, and loading state
 */
export function useProfileHeader(userId: string) {
  // Fetch user profile data
  const { profile, isLoading: isProfileLoading } = Hooks.useUserProfile(userId);

  // Fetch profile statistics
  const { stats, isLoading: isStatsLoading } = Hooks.useProfileStats(userId);

  // Provide default profile values when profile is null (loading state)
  // This centralizes the fallback logic and ensures type consistency
  const profileData = profile ?? DEFAULT_PROFILE;

  // Get action handlers (only when profile is available)
  const actions = Hooks.useProfileActions({
    publicKey: profileData.publicKey,
    link: profileData.link,
  });

  return {
    profile: profileData,
    stats,
    actions,
    isLoading: isProfileLoading || isStatsLoading,
  };
}
