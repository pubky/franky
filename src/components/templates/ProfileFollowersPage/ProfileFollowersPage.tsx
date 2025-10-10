'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export function ProfileFollowersPage() {
  return (
    <Molecules.EmptyState
      icon={Libs.Users}
      title="No followers yet"
      description="Grow your audience by sharing interesting content."
    />
  );
}
