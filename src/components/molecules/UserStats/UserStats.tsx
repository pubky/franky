'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface UserStatsProps {
  tagsCount: number;
  postsCount: number;
  className?: string;
}

export function UserStats({ tagsCount, postsCount, className }: UserStatsProps) {
  return (
    <div className={Libs.cn('flex gap-3 items-center', className)}>
      <div className="flex flex-col gap-0 items-start">
        <Atoms.Typography className="text-xs text-muted-foreground font-medium uppercase tracking-[1.2px] leading-4">
          Tags
        </Atoms.Typography>
        <Atoms.Typography size="sm" className="font-bold leading-5">
          {tagsCount}
        </Atoms.Typography>
      </div>
      <div className="flex flex-col gap-0 items-start">
        <Atoms.Typography className="text-xs text-muted-foreground font-medium uppercase tracking-[1.2px] leading-4">
          posts
        </Atoms.Typography>
        <Atoms.Typography size="sm" className="font-bold leading-5">
          {postsCount}
        </Atoms.Typography>
      </div>
    </div>
  );
}
