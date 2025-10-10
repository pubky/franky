'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { APP_ROUTES } from '@/app';

export function ProfileFollowingPage() {
  const router = useRouter();

  return (
    <Molecules.EmptyState
      icon={Libs.UsersRound2}
      title="Not following anyone yet"
      description="Discover and follow interesting people to see their posts in your feed."
      action={{
        label: 'Discover people',
        onClick: () => router.push(APP_ROUTES.SEARCH),
      }}
    />
  );
}
