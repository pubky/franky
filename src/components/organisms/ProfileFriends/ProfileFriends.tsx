'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface ProfileFriendsProps {
  className?: string;
}

export function ProfileFriends({ className }: ProfileFriendsProps) {
  // TODO: Replace with actual data fetching
  const mockFriends: Molecules.UserData[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
        <Atoms.Card className="p-6 animate-pulse">
          <div className="h-20 bg-muted rounded" />
        </Atoms.Card>
      </Atoms.Container>
    );
  }

  if (mockFriends.length === 0) {
    return (
      <Atoms.Card className={Libs.cn('p-12 text-center', className)}>
        <Libs.UsersRound className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <Atoms.Heading level={3} size="lg" className="mb-2">
          No friends yet
        </Atoms.Heading>
        <Atoms.Typography size="md" className="text-muted-foreground">
          Friends (mutual follows) will appear here.
        </Atoms.Typography>
      </Atoms.Card>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      <Atoms.Card className="p-6">
        <Atoms.Heading level={2} size="lg" className="mb-4">
          Friends
        </Atoms.Heading>
        <Atoms.Container className="flex flex-col gap-3">
          {mockFriends.map((user) => (
            <Molecules.User key={user.id} user={user} showAction={false} />
          ))}
        </Atoms.Container>
      </Atoms.Card>
    </Atoms.Container>
  );
}

