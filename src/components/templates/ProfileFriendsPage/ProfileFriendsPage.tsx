'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export function ProfileFriendsPage() {
  return (
    <Molecules.EmptyState
      icon={Libs.Heart}
      title="No friends yet"
      description="Connect with people you know to build your network."
    />
  );
}
