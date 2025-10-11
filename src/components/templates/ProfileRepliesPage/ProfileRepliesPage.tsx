'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export function ProfileRepliesPage() {
  return (
    <Molecules.EmptyState
      icon={Libs.MessageSquare}
      title="No replies yet"
      description="Engage with others to see replies here."
    />
  );
}
