'use client';

import * as React from 'react';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { APP_ROUTES } from '@/app';

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
        icon={<Libs.UserRoundPlus size={48} className="text-brand" />}
        title="No friends yet"
        description={
          <>
            <p className="mb-0">Follow someone, and if they follow you back, you&apos;ll become friends!</p>
            <p>Start following Pubky users, you never know who might follow you back!</p>
          </>
        }
        backgroundImage="/images/keyhole.png"
        mobileBackgroundImage="/images/keyhole.png"
        className={className}
      >
        <div className="flex gap-6 items-center justify-center flex-wrap lg:flex-row flex-col">
          <Link href={APP_ROUTES.SEARCH}>
            <Atoms.Button variant="secondary" size="sm">
              <Libs.UserRoundPlus className="w-4 h-4" />
              Who to Follow
            </Atoms.Button>
          </Link>
          <Link href={APP_ROUTES.HOT}>
            <Atoms.Button variant="secondary" size="sm">
              <Libs.UserRoundPlus className="w-4 h-4" />
              Popular Users
            </Atoms.Button>
          </Link>
        </div>
      </Molecules.ContentNotFound>
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
