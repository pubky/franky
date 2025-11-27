'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { FollowerData } from '@/hooks/useFollowers';

interface FollowersListProps {
  followers: FollowerData[];
}

export function FollowersList({ followers }: FollowersListProps) {
  return (
    <Atoms.Container className="gap-3.5 rounded-md bg-transparent p-0 lg:gap-3 lg:bg-card lg:p-6">
      {followers.map((follower) => (
        <Molecules.FollowerItem key={follower.id} follower={follower} />
      ))}
    </Atoms.Container>
  );
}
