'use client';

import * as Hooks from '@/hooks';

// Re-export types from composed hooks for backwards compatibility
export type { ProfileStats } from '@/hooks/useProfileStats';
export type { UserProfile } from '@/hooks/useUserProfile';
export type { ProfileActions } from '@/hooks/useProfileActions';

/**
 * Composite hook that combines user profile data, stats, and actions.
 * This hook composes three focused hooks following Single Responsibility Principle:
 *
 * - useUserProfile: Pure data fetching for user details
 * - useProfileStats: Pure data fetching for statistics
 * - useProfileActions: Action handlers for user interactions
 *
 * @param userId - The user ID to fetch profile data for
 * @returns Combined profile data, stats, actions, and loading state
 */
export function useProfileHeader(userId: string) {
  // Fetch user profile data
  const { profile, isLoading: isProfileLoading } = Hooks.useUserProfile(userId);

  // Fetch profile statistics
  const { stats, isLoading: isStatsLoading } = Hooks.useProfileStats(userId);

  // Get action handlers (only when profile is available)
  const actions = Hooks.useProfileActions({
    publicKey: profile?.publicKey ?? '',
    link: profile?.link ?? '',
  });

  return {
    profile,
    stats,
    actions,
    isLoading: isProfileLoading || isStatsLoading,
  };
}
