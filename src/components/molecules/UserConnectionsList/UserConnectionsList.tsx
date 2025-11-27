'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { UserConnectionData } from '@/hooks/useProfileConnections';

interface UserConnectionsListProps {
  connections: UserConnectionData[];
}

export function UserConnectionsList({ connections }: UserConnectionsListProps) {
  return (
    <Atoms.Container className="gap-3.5 rounded-md bg-transparent p-0 lg:gap-3 lg:bg-card lg:p-6">
      {connections.map((connection) => (
        <Molecules.FollowerItem key={connection.id} follower={connection} />
      ))}
    </Atoms.Container>
  );
}
