'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
import Link from 'next/link';
import { APP_ROUTES } from '@/app';

export interface ProfileFollowersProps {
  className?: string;
}

export function ProfileFollowers({ className }: ProfileFollowersProps) {
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);
  const isOwnProfile = !!currentUserPubky;

  // TODO: Replace with actual data fetching
  const followers: Molecules.UserData[] = [];
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

  if (followers.length === 0) {
    return (
      <Molecules.ContentNotFound
        icon={<Libs.Users size={48} className="text-[#c8ff00]" />}
        title={isOwnProfile ? 'Looking for followers?' : 'No followers yet'}
        description={
          isOwnProfile ? (
            <>
              When someone follows this account, their profile will appear here.
              <br />
              Start posting and engaging with others to grow your followers.
            </>
          ) : (
            'There are no followers to show.'
          )
        }
        className={className}
      >
        {isOwnProfile && (
          <Link href={APP_ROUTES.HOME}>
            <Atoms.Button className="z-10 w-auto">
              <Libs.Plus className="w-6 h-6 mr-2" />
              Create a Post
            </Atoms.Button>
          </Link>
        )}
      </Molecules.ContentNotFound>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      <Atoms.Card className="p-6">
        <Atoms.Heading level={2} size="lg" className="mb-4">
          Followers
        </Atoms.Heading>
        <Atoms.Container className="flex flex-col gap-3">
          {followers.map((user) => (
            <Molecules.User key={user.id} user={user} showAction={false} />
          ))}
        </Atoms.Container>
      </Atoms.Card>
    </Atoms.Container>
  );
}
