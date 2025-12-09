'use client';

import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { APP_ROUTES } from '@/app/routes';
import type { ActiveUsersProps } from './ActiveUsers.types';

/**
 * ActiveUsers
 *
 * Sidebar section showing active users (influencers) with their post/tag counts.
 * Uses SidebarSection and UserListItem for consistent layout.
 *
 * Note: This is an Organism because it interacts with Core via hooks (useUserStream, useFollowUser).
 */
export function ActiveUsers({ className }: ActiveUsersProps) {
  const router = useRouter();
  const { users, isLoading: isStreamLoading } = Hooks.useUserStream({
    streamId: Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
    limit: 3,
    includeCounts: true,
    includeRelationships: true,
  });
  const { toggleFollow, isUserLoading } = Hooks.useFollowUser();

  const handleUserClick = (pubky: Core.Pubky) => {
    router.push(`${APP_ROUTES.PROFILE}/${pubky}`);
  };

  const handleFollowClick = async (userId: Core.Pubky, isFollowing: boolean) => {
    await toggleFollow(userId, isFollowing);
  };

  const handleSeeAll = () => {
    // TODO: Navigate to all active users page
    Libs.Logger.debug('[ActiveUsers] See all clicked');
  };

  return (
    <Molecules.SidebarSection
      title="Active users"
      footerIcon={Libs.Users}
      footerText="See all"
      onFooterClick={handleSeeAll}
      className={className}
      data-testid="active-users"
    >
      {users.length === 0 ? (
        <Atoms.Typography size="md" className="text-muted-foreground">
          No users to show
        </Atoms.Typography>
      ) : (
        users.map((user) => (
          <Molecules.UserListItem
            key={user.id}
            user={user}
            variant="compact"
            showStats
            isLoading={isUserLoading(user.id)}
            isStatusLoading={isStreamLoading}
            onUserClick={handleUserClick}
            onFollowClick={handleFollowClick}
          />
        ))
      )}
    </Molecules.SidebarSection>
  );
}
