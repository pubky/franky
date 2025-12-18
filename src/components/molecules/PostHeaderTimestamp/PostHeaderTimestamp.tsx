'use client';

import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import type { PostHeaderTimestampProps } from './PostHeaderTimestamp.types';

export function PostHeaderTimestamp({ timeAgo }: PostHeaderTimestampProps) {
  return (
    <Atoms.Container className="flex flex-shrink-0 items-center gap-1" overrideDefaults>
      <Libs.Clock className="size-4 text-muted-foreground" />
      <Atoms.Typography
        as="span"
        className="text-xs leading-4 font-medium tracking-[0.075rem] whitespace-nowrap text-muted-foreground"
        overrideDefaults
      >
        {timeAgo}
      </Atoms.Typography>
    </Atoms.Container>
  );
}
