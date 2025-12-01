'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

/**
 * ProfileFriends
 *
 * Organism that displays a user's friends list with infinite scroll pagination.
 * Handles data fetching and loading states.
 */
export function ProfileFriends() {
  const { connections, count, isLoading, isLoadingMore, hasMore, loadMore } = Hooks.useProfileConnections(
    Hooks.CONNECTION_TYPE.FRIENDS,
  );

  // Handle infinite scroll
  const { sentinelRef } = Hooks.useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

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
        <Molecules.FriendsEmpty />
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="mt-6 gap-4 lg:mt-0">
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Friends {count > 0 && `(${count})`}
      </Atoms.Heading>
      <Molecules.UserConnectionsList connections={connections} />

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
