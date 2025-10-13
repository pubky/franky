'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
import Link from 'next/link';
import { APP_ROUTES } from '@/app';

export interface ProfileFollowingProps {
  className?: string;
}

export function ProfileFollowing({ className }: ProfileFollowingProps) {
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);
  const isOwnProfile = !!currentUserPubky;

  // TODO: Replace with actual data fetching
  const following: Molecules.UserData[] = [];
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

  if (following.length === 0) {
    return (
      <Molecules.ContentNotFound
        icon={<Libs.UserPlus size={48} className="text-[#c8ff00]" />}
        title={isOwnProfile ? 'You are the algorithm' : 'No following yet'}
        description={
          isOwnProfile ? (
            <>
              Following accounts is a simple way to curate your timeline.
              <br />
              Stay updated on the topics and people that interest you.
            </>
          ) : (
            'There are no following to show.'
          )
        }
        className={className}
      >
        {isOwnProfile && (
          <div className="flex gap-3 z-10 justify-center flex-wrap">
            <Link href={APP_ROUTES.SEARCH}>
              <Atoms.Button>
                <Libs.UserPlus className="w-4 h-4 mr-2" />
                Who to Follow
              </Atoms.Button>
            </Link>
            <Link href={APP_ROUTES.HOT}>
              <Atoms.Button>
                <Libs.UserPlus className="w-4 h-4 mr-2" />
                Active Users
              </Atoms.Button>
            </Link>
          </div>
        )}
      </Molecules.ContentNotFound>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      <Atoms.Card className="p-6">
        <Atoms.Heading level={2} size="lg" className="mb-4">
          Following
        </Atoms.Heading>
        <Atoms.Container className="flex flex-col gap-3">
          {following.map((user) => (
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
