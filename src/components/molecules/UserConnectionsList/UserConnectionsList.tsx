'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { UserConnectionsListProps } from './UserConnectionsList.types';

export function UserConnectionsList({ connections, onFollow, currentUserPubky }: UserConnectionsListProps) {
  return (
    <Atoms.Container className="gap-3.5 rounded-md bg-transparent p-0 lg:gap-3 lg:bg-card lg:p-6">
      {connections.map((connection) => (
        <Molecules.FollowerItem
          key={connection.id}
          follower={connection}
          isFollowing={connection.isFollowing}
          onFollow={onFollow}
          isCurrentUser={currentUserPubky === connection.id}
        />
      ))}
    </Atoms.Container>
  );
}
