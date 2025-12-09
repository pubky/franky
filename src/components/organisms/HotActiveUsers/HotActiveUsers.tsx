'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { APP_ROUTES } from '@/app/routes';
import type { HotActiveUsersProps } from './HotActiveUsers.types';

const DEFAULT_USERS_LIMIT = 10;

/**
 * Get the user stream ID based on reach filter.
 * - ALL: most_followed (global)
 * - FOLLOWING: currentUser:following (people I follow)
 * - FRIENDS: currentUser:friends (my friends)
 */
function useActiveUsersStreamId(currentUserPubky: Core.Pubky | null): Core.UserStreamId {
  const reach = Core.useHotStore((state) => state.reach);

  const streamId = useMemo(() => {
    if (reach === Core.REACH.ALL) {
      return Core.UserStreamTypes.MOST_FOLLOWED;
    }

    // For FOLLOWING and FRIENDS, we need the current user's pubky
    if (!currentUserPubky) {
      return Core.UserStreamTypes.MOST_FOLLOWED;
    }

    if (reach === Core.REACH.FOLLOWING) {
      return `${currentUserPubky}:following` as Core.UserStreamId;
    }

    if (reach === Core.REACH.FRIENDS) {
      return `${currentUserPubky}:friends` as Core.UserStreamId;
    }

    return Core.UserStreamTypes.MOST_FOLLOWED;
  }, [reach, currentUserPubky]);

  Libs.Logger.debug('[HotActiveUsers] streamId changed', { reach, streamId, currentUserPubky });

  return streamId;
}

/**
 * HotActiveUsers
 *
 * Organism that displays active/influential users in a full list format.
 * Uses reach filter to show:
 * - ALL: Most followed users globally
 * - FOLLOWING: People the current user follows
 * - FRIENDS: Friends of the current user
 */
export function HotActiveUsers({ limit = DEFAULT_USERS_LIMIT, className }: HotActiveUsersProps) {
  const router = useRouter();
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);
  const streamId = useActiveUsersStreamId(currentUserPubky);

  const { users, isLoading } = Hooks.useUserStream({
    streamId,
    limit,
    includeCounts: true,
    includeRelationships: true,
    includeTags: true,
  });

  const { toggleFollow, isUserLoading } = Hooks.useFollowUser();

  const handleUserClick = (pubky: Core.Pubky) => {
    router.push(`${APP_ROUTES.PROFILE}/${pubky}`);
  };

  const handleFollowClick = async (userId: Core.Pubky, isCurrentlyFollowing: boolean) => {
    await toggleFollow(userId, isCurrentlyFollowing);
  };

  // TODO: Replace with Skeleton component
  if (isLoading) {
    return (
      <Atoms.Container overrideDefaults className={Libs.cn('flex flex-col gap-2', className)}>
        <Atoms.Heading level={5} size="lg" className="font-light text-muted-foreground">
          Active users
        </Atoms.Heading>
        <Atoms.Container className="gap-3.5 rounded-md bg-card p-6">
          <Atoms.Typography size="md" className="text-muted-foreground">
            Loading...
          </Atoms.Typography>
        </Atoms.Container>
      </Atoms.Container>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn('flex flex-col gap-2', className)}
      data-testid="hot-active-users"
    >
      <Atoms.Heading level={5} size="lg" className="font-light text-muted-foreground">
        Active users
      </Atoms.Heading>
      <Atoms.Container className="gap-3.5 rounded-md py-2 lg:gap-3">
        {users.map((user) => (
          <Molecules.UserListItem
            key={user.id}
            user={{
              id: user.id,
              name: user.name,
              avatarUrl: user.avatarUrl ?? undefined,
              image: user.image,
              tags: user.tags ?? [],
              stats: user.counts
                ? {
                    tags: user.counts.tags,
                    posts: user.counts.posts,
                  }
                : { tags: 0, posts: 0 },
              isFollowing: user.isFollowing,
            }}
            variant="full"
            isLoading={isUserLoading(user.id)}
            isStatusLoading={isLoading}
            isCurrentUser={currentUserPubky === user.id}
            onUserClick={handleUserClick}
            onFollowClick={handleFollowClick}
          />
        ))}
      </Atoms.Container>
    </Atoms.Container>
  );
}
