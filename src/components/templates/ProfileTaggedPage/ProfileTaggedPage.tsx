'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export function ProfileTaggedPage() {
  return (
    <Molecules.EmptyState icon={Libs.Tag} title="No tags yet" description="You haven't been tagged in any content." />
  );
}
