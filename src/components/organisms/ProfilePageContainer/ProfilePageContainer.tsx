'use client';

import * as React from 'react';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import * as Providers from '@/providers';

export interface ProfilePageContainerProps {
  /** Child pages to render in the main content area */
  children: React.ReactNode;
}

/**
 * ProfilePageContainer - Smart component that handles business logic for profile pages
 *
 * This container is responsible for:
 * - Reading profile context (pubky, isOwnProfile)
 * - Data fetching (profile, stats)
 * - Navigation state (active pages, routing)
 * - Action handlers (edit, copy, sign out, follow, etc.)
 *
 * It delegates presentation concerns to ProfilePageLayout, which is a dumb component
 * that only receives props and renders UI.
 *
 * This separation follows the container/presentation pattern:
 * - Container (this): Smart, handles logic, connects to stores/hooks
 * - Presentation (ProfilePageLayout): Dumb, receives props, renders UI
 *
 * @example
 * ```tsx
 * // In app/profile/layout.tsx
 * export default function ProfileLayout({ children }) {
 *   return (
 *     <ProfileProvider>
 *       <ProfilePageContainer>
 *         {children}
 *       </ProfilePageContainer>
 *     </ProfileProvider>
 *   );
 * }
 * ```
 */
export function ProfilePageContainer({ children }: ProfilePageContainerProps) {
  // Business logic: Get profile context (pubky and isOwnProfile)
  const { pubky, isOwnProfile } = Providers.useProfileContext();

  // Business logic: Fetch profile data and stats
  // Note: useProfileHeader guarantees a non-null profile with default values during loading
  const { profile, stats, actions, isLoading } = Hooks.useProfileHeader(pubky ?? '');

  // Business logic: Handle navigation state
  const { activePage, filterBarActivePage, navigateToPage } = Hooks.useProfileNavigation();

  // Business logic: Handle follow/unfollow for other users' profiles
  const { toggleFollow, isLoading: isFollowLoading } = Hooks.useFollowUser();
  const { isFollowing } = Hooks.useIsFollowing(pubky ?? '');

  // Business logic: Handle mute/unmute for other users' profiles
  const { toggleMute, isLoading: isMuteLoading, isUserLoading: isMuteUserLoading } = Hooks.useMuteUser();
  const { isMuted } = Hooks.useMutedUsers();
  const isProfileMuted = pubky ? isMuted(pubky) : false;

  const handleFollowToggle = async () => {
    if (!pubky) return;
    await toggleFollow(pubky, isFollowing);
  };

  const handleMuteToggle = async () => {
    if (!pubky) return;
    try {
      await toggleMute(pubky, isProfileMuted);
      Molecules.toast({
        title: isProfileMuted ? 'User unmuted' : 'User muted',
        description: `${profile.name || pubky} has been ${isProfileMuted ? 'unmuted' : 'muted'}.`,
      });
    } catch (error) {
      Molecules.toast({
        title: 'Error',
        description: Libs.isAppError(error) ? error.message : 'Failed to update mute status',
      });
    }
  };

  const mergedActions = {
    ...actions,
    onFollowToggle: handleFollowToggle,
    isFollowLoading,
    isFollowing,
    onMuteToggle: handleMuteToggle,
    isMuteLoading: isMuteLoading || (pubky ? isMuteUserLoading(pubky) : false),
    isMuted: isProfileMuted,
  };

  // Delegate presentation to layout organism
  return (
    <Organisms.ProfilePageLayout
      profile={profile}
      stats={stats}
      actions={mergedActions}
      activePage={activePage}
      filterBarActivePage={filterBarActivePage}
      navigateToPage={navigateToPage}
      isLoading={isLoading}
      isOwnProfile={isOwnProfile}
    >
      {children}
    </Organisms.ProfilePageLayout>
  );
}
