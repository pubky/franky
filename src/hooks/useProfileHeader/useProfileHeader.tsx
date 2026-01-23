'use client';

// Import directly to avoid circular dependency with @/hooks barrel
import { useUserProfile, type UserProfile } from '@/hooks/useUserProfile';
import { useProfileStats, type ProfileStats } from '@/hooks/useProfileStats';
import { useProfileActions, type ProfileActions } from '@/hooks/useProfileActions';

// Re-export types from composed hooks for backwards compatibility
export type { ProfileStats, UserProfile, ProfileActions };

/**
 * Default profile data used during loading state or when profile is unavailable.
 */
const DEFAULT_PROFILE: UserProfile = {
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
 * @returns Combined profile data (never null), stats, actions, loading state, and userNotFound flag
 */
export function useProfileHeader(userId: string) {
  // Fetch user profile data
  const { profile, isLoading: isProfileLoading } = useUserProfile(userId);

  // Fetch profile statistics
  const { stats, isLoading: isStatsLoading } = useProfileStats(userId);

  // Combined loading state
  const isLoading = isProfileLoading || isStatsLoading;

  // User not found: loading is complete but profile is null
  const userNotFound = !isLoading && profile === null;

  // Provide default profile values when profile is null (loading state)
  // This centralizes the fallback logic and ensures type consistency
  const profileData = profile ?? DEFAULT_PROFILE;

  // Get action handlers (only when profile is available)
  const actions = useProfileActions({
    publicKey: profileData.publicKey,
    link: profileData.link,
  });

  return {
    profile: profileData,
    stats,
    actions,
    isLoading,
    userNotFound,
  };
}
