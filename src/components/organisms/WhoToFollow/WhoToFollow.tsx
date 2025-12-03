'use client';

import { useRouter } from 'next/navigation';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { APP_ROUTES } from '@/app/routes';
import type { WhoToFollowProps } from './WhoToFollow.types';

/**
 * WhoToFollow
 *
 * Sidebar section showing recommended users to follow.
 * Uses SidebarSection and SidebarUserItem for consistent layout.
 *
 * Note: This is an Organism because it interacts with Core via hooks (useUserStream, useFollowUser).
 */
export function WhoToFollow({ className }: WhoToFollowProps) {
  const router = useRouter();
  const { users } = Hooks.useUserStream({
    streamId: Core.UserStreamTypes.RECOMMENDED,
    limit: 3,
    includeRelationships: true,
  });
  const { toggleFollow, isLoading: isFollowLoading } = Hooks.useFollowUser();

  const handleUserClick = (pubky: Core.Pubky) => {
    router.push(`${APP_ROUTES.PROFILE}/${pubky}`);
  };

  const handleFollowClick = async (userId: Core.Pubky, isFollowing: boolean) => {
    await toggleFollow(userId, isFollowing);
  };

  const handleSeeAll = () => {
    // TODO: Navigate to all recommended users page
    Libs.Logger.debug('[WhoToFollow] See all clicked');
  };

  return (
    <Molecules.SidebarSection
      title="Who to follow"
      footerIcon={Libs.Users}
      footerText="See all"
      onFooterClick={handleSeeAll}
      className={className}
      data-testid="who-to-follow"
    >
      {users.map((user) => (
        <Molecules.SidebarUserItem
          key={user.id}
          id={user.id}
          name={user.name}
          image={user.image}
          subtitle={Libs.formatPublicKey({ key: user.id, length: 12 })}
          isFollowing={user.isFollowing}
          isLoading={isFollowLoading}
          onUserClick={handleUserClick}
          onFollowClick={handleFollowClick}
        />
      ))}
    </Molecules.SidebarSection>
  );
}
