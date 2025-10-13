'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface ProfileFollowersProps {
  className?: string;
}

export function ProfileFollowers({ className }: ProfileFollowersProps) {
  // TODO: Replace with actual data fetching
  const mockFollowers: Molecules.UserData[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      handle: '@alice',
      avatar: undefined,
      tagsCount: 5,
      postsCount: 10,
    },
    {
      id: '2',
      name: 'Bob Smith',
      handle: '@bob',
      avatar: undefined,
      tagsCount: 3,
      postsCount: 8,
    },
  ];
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

  if (mockFollowers.length === 0) {
    return (
      <Atoms.Card className={Libs.cn('p-12 text-center', className)}>
        <Libs.Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <Atoms.Heading level={3} size="lg" className="mb-2">
          No followers yet
        </Atoms.Heading>
        <Atoms.Typography size="md" className="text-muted-foreground">
          People who follow you will appear here.
        </Atoms.Typography>
      </Atoms.Card>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      <Atoms.Card className="p-6">
        <Atoms.Heading level={2} size="lg" className="mb-4">
          Followers
        </Atoms.Heading>
        <Atoms.Container className="flex flex-col gap-3">
          {mockFollowers.map((user) => (
            <Molecules.User key={user.id} user={user} showAction={false} />
          ))}
        </Atoms.Container>
      </Atoms.Card>
    </Atoms.Container>
  );
}

