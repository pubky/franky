'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import * as Providers from '@/providers';

/**
 * ProfileFollowers
 *
 * Organism that displays a user's followers list with infinite scroll pagination.
 * Handles data fetching, loading states, and follow/unfollow actions.
 * Uses ProfileContext to get the target user's pubky.
 */
export function ProfileFollowers() {
  // Get the profile pubky from context
  const { pubky } = Providers.useProfileContext();

  const { connections, count, isLoading, isLoadingMore, hasMore, loadMore } = Hooks.useProfileConnections(
    Hooks.CONNECTION_TYPE.FOLLOWERS,
    pubky ?? undefined,
  );
  const { toggleFollow } = Hooks.useFollowUser();

  // Handle infinite scroll
  const { sentinelRef } = Hooks.useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  // Handle follow/unfollow action
  const handleFollow = async (userId: Core.Pubky, isCurrentlyFollowing: boolean) => {
    await toggleFollow(userId, isCurrentlyFollowing);
  };

  if (isLoading) {
    return (
      <Atoms.Container className="mt-6 flex min-h-[200px] items-center justify-center lg:mt-0">
        <Atoms.Spinner />
      </Atoms.Container>
    );
  }

  if (connections.length === 0) {
    return (
      <Atoms.Container className="mt-6 lg:mt-0">
        <Molecules.FollowersEmpty />
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="mt-6 gap-4 lg:mt-0">
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Followers {count > 0 && `(${count})`}
      </Atoms.Heading>
      <Molecules.UserConnectionsList connections={connections} onFollow={handleFollow} />

      {/* Infinite scroll trigger */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <Atoms.Container className="flex justify-center py-4">
          <Atoms.Spinner />
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
