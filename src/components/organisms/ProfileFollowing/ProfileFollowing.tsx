'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface ProfileFollowingProps {
  className?: string;
}

export function ProfileFollowing({ className }: ProfileFollowingProps) {
  // TODO: Replace with actual data fetching
  const mockFollowing: Molecules.UserData[] = [
    {
      id: '1',
      name: 'Charlie Brown',
      handle: '@charlie',
      avatar: undefined,
      tagsCount: 7,
      postsCount: 15,
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

  if (mockFollowing.length === 0) {
    return (
      <Atoms.Card className={Libs.cn('p-12 text-center', className)}>
        <Libs.UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <Atoms.Heading level={3} size="lg" className="mb-2">
          Not following anyone yet
        </Atoms.Heading>
        <Atoms.Typography size="md" className="text-muted-foreground">
          People you follow will appear here.
        </Atoms.Typography>
      </Atoms.Card>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      <Atoms.Card className="p-6">
        <Atoms.Heading level={2} size="lg" className="mb-4">
          Following
        </Atoms.Heading>
        <Atoms.Container className="flex flex-col gap-3">
          {mockFollowing.map((user) => (
            <Molecules.User
              key={user.id}
              user={user}
              showAction={true}
              actionIcon={<Libs.UserMinus className="w-4 h-4" />}
              actionVariant={Atoms.ButtonVariant.OUTLINE}
            />
          ))}
        </Atoms.Container>
      </Atoms.Card>
    </Atoms.Container>
  );
}

