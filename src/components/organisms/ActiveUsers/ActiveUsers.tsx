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
 * UserStatsSubtitle
 *
 * Renders user stats (tags and posts counts) with Lucide icons.
 * Matches the Figma design: Tag icon + count, StickyNote icon + count.
 */
function UserStatsSubtitle({ tags, posts }: { tags: number; posts: number }) {
  return (
    <Atoms.Container overrideDefaults className="flex items-center gap-2 text-sm text-muted-foreground/50">
      <Atoms.Container overrideDefaults className="flex items-center gap-1">
        <Libs.Tag className="size-3.5" />
        <Atoms.Typography as="span" overrideDefaults>
          {tags}
        </Atoms.Typography>
      </Atoms.Container>
      <Atoms.Container overrideDefaults className="flex items-center gap-1">
        <Libs.StickyNote className="size-3.5" />
        <Atoms.Typography as="span" overrideDefaults>
          {posts}
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}

/**
 * ActiveUsers
 *
 * Sidebar section showing active users (influencers) with their post/tag counts.
 * Uses SidebarSection and SidebarUserItem for consistent layout.
 *
 * Note: This is an Organism because it interacts with Core via hooks (useUserStream, useFollowUser).
 */
export function ActiveUsers({ className }: ActiveUsersProps) {
  const router = useRouter();
  const { users } = Hooks.useUserStream({
    streamId: Core.UserStreamTypes.TODAY_INFLUENCERS_ALL,
    limit: 3,
    includeCounts: true,
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
      {users.map((user) => (
        <Molecules.SidebarUserItem
          key={user.id}
          id={user.id}
          name={user.name}
          image={user.image}
          subtitle={<UserStatsSubtitle tags={user.counts?.tags ?? 0} posts={user.counts?.posts ?? 0} />}
          isFollowing={user.isFollowing}
          isLoading={isFollowLoading}
          onUserClick={handleUserClick}
          onFollowClick={handleFollowClick}
        />
      ))}
    </Molecules.SidebarSection>
  );
}
