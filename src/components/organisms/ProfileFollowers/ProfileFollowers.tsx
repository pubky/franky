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

// Mock data matching Figma design
const mockFollowers: Molecules.FollowerData[] = [
  {
    id: '1',
    name: 'Matt Jones',
    pubky: '1RX3...KO43',
    avatar: 'https://i.pravatar.cc/150?img=1',
    tags: [
      { label: 'bitcoin', color: '#004BFF' },
      { label: 'crypto', color: '#FF9900' },
      { label: 'hot', color: '#FF0000' },
    ],
    tagsCount: 761,
    postsCount: 158,
    isFollowing: true,
  },
  {
    id: '2',
    name: 'Carl Smith',
    pubky: '1YX3...98LY',
    avatar: 'https://i.pravatar.cc/150?img=12',
    tags: [
      { label: 'frontender', color: '#FF0000' },
      { label: 'funny', color: '#00F0FF' },
      { label: 'html', color: '#004BFF' },
    ],
    tagsCount: 234,
    postsCount: 89,
    isFollowing: false,
  },
  {
    id: '3',
    name: 'Username',
    pubky: '1YXP...7R32',
    avatar: 'https://i.pravatar.cc/150?img=5',
    tags: [
      { label: 'bitcoin', color: '#004BFF' },
      { label: 'crypto', color: '#FF9900' },
      { label: 'hot', color: '#FF0000' },
    ],
    tagsCount: 542,
    postsCount: 203,
    isFollowing: true,
  },
  {
    id: '4',
    name: 'Anna Pleb',
    pubky: '1YX1...PL32',
    avatar: 'https://i.pravatar.cc/150?img=3',
    tags: [
      { label: 'pleb', color: '#00F0FF' },
      { label: 'crypto', color: '#FF9900' },
      { label: 'hot', color: '#FF0000' },
    ],
    tagsCount: 123,
    postsCount: 45,
    isFollowing: true,
  },
  {
    id: '5',
    name: 'Jack Anderson',
    pubky: '1P92...X47A',
    avatar: 'https://i.pravatar.cc/150?img=8',
    tags: [
      { label: 'bitcoin', color: '#004BFF' },
      { label: 'crypto', color: '#FF9900' },
      { label: 'hot', color: '#FF0000' },
    ],
    tagsCount: 456,
    postsCount: 112,
    isFollowing: false,
  },
];

export function ProfileFollowers({ className }: ProfileFollowersProps) {
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);
  const isOwnProfile = !!currentUserPubky;

  // TODO: Replace with actual data fetching
  const followers: Molecules.FollowerData[] = mockFollowers;
  const isLoading = false;

  const handleFollow = (userId: string) => {
    // TODO: Implement follow/unfollow logic
    console.log('Follow/unfollow user:', userId);
  };

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
        icon={<Libs.UsersRound2 size={48} className="text-brand" />}
        title={isOwnProfile ? 'Looking for followers?' : 'No followers yet'}
        description={
          isOwnProfile ? (
            <>
              <p className="mb-0">When someone follows this account, their profile will appear here.</p>
              <p>Start posting and engaging with others to grow your followers!</p>
            </>
          ) : (
            'There are no followers to show.'
          )
        }
        backgroundImage="/images/keyhole.png"
        mobileBackgroundImage="/images/keyhole.png"
        className={className}
      >
        {isOwnProfile && (
          <Link href={APP_ROUTES.HOME}>
            <Atoms.Button variant="default" size="sm">
              <Libs.Plus className="w-4 h-4" />
              Create a Post
            </Atoms.Button>
          </Link>
        )}
      </Molecules.ContentNotFound>
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-3 lg:gap-6', className)}>
      {/* Followers heading - only on mobile */}
      <Atoms.Heading level={5} size="lg" className="text-muted-foreground font-light lg:hidden">
        Followers
      </Atoms.Heading>

      {/* Desktop: Single card with all followers */}
      <Atoms.Card className="hidden lg:block p-6 rounded-md">
        <div className="flex flex-col gap-3.5">
          {followers.map((follower) => (
            <Molecules.FollowerItem key={follower.id} follower={follower} onFollow={handleFollow} />
          ))}
        </div>
      </Atoms.Card>

      {/* Mobile: Individual cards for each follower */}
      <div className="flex flex-col gap-3 lg:hidden">
        {followers.map((follower) => (
          <Atoms.Card key={follower.id} className="p-6 rounded-md">
            <Molecules.FollowerItem follower={follower} onFollow={handleFollow} />
          </Atoms.Card>
        ))}
      </div>
    </Atoms.Container>
  );
}
