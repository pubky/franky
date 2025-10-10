'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export function ProfileNotificationsPage() {
  return (
    <Molecules.EmptyState
      icon={Libs.Bell}
      title="No notifications yet"
      description="You'll see updates on your activity here."
    />
  );
}
