'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

import * as Hooks from '@/hooks';
import * as Providers from '@/providers';
import { ProfilePageHeader } from '@/organisms';

/**
 * ProfileProfile
 *
 * Displays the user's profile page for mobile view.
 * Shows profile header, tagged section, and links.
 * Uses ProfileContext to get the target user's pubky.
 */
export function ProfileProfile() {
  // Get the profile pubky and isOwnProfile from context
  const { pubky, isOwnProfile } = Providers.useProfileContext();

  // Note: useProfileHeader guarantees a non-null profile with default values during loading
  const { profile, actions, isLoading } = Hooks.useProfileHeader(pubky ?? '');

  // Handle follow/unfollow for other users' profiles
  const { toggleFollow, isLoading: isFollowLoading } = Hooks.useFollowUser();
  const { isFollowing } = Hooks.useIsFollowing(pubky ?? '');

  // Get tags for the user
  const {
    tags,
    isLoading: isLoadingTags,
    handleTagToggle,
  } = Hooks.useTagged(pubky, {
    enablePagination: false,
    enableStats: false,
  });

  // Create follow toggle handler
  const handleFollowToggle = React.useCallback(async () => {
    if (!pubky) return;
    await toggleFollow(pubky, isFollowing);
  }, [pubky, isFollowing, toggleFollow]);

  // Merge actions with follow-related actions
  const mergedActions = React.useMemo(
    () => ({
      ...actions,
      onFollowToggle: handleFollowToggle,
      isFollowLoading,
      isFollowing,
    }),
    [actions, handleFollowToggle, isFollowLoading, isFollowing],
  );

  return (
    <Atoms.Container overrideDefaults={true} className="mt-6 flex flex-col gap-6 lg:mt-0 lg:hidden">
      {!isLoading && <ProfilePageHeader profile={profile} actions={mergedActions} isOwnProfile={isOwnProfile} />}

      {/* Tagged as section */}
      <Molecules.ProfilePageTaggedAs
        tags={tags}
        isLoading={isLoadingTags}
        onTagClick={handleTagToggle}
        pubky={pubky ?? ''}
      />

      {/* Links section */}
      <Molecules.ProfilePageLinks links={profile?.links} />
    </Atoms.Container>
  );
}
