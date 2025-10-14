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
      <Molecules.ContentNotFound
        icon={<Libs.HeartHandshake size={48} className="text-brand" />}
        title="No friends yet"
        description="Friends (mutual follows) will appear here."
        className={className}
      />
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
