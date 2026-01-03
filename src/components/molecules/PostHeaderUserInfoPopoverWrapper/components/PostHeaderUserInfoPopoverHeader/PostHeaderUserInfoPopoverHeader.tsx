'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { PostHeaderUserInfoPopoverHeaderProps } from './PostHeaderUserInfoPopoverHeader.types';

export function PostHeaderUserInfoPopoverHeader({
  userName,
  formattedPublicKey,
  avatarUrl,
}: PostHeaderUserInfoPopoverHeaderProps) {
  return (
    <Atoms.Container className="flex min-w-0 items-center gap-2" overrideDefaults>
      <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={userName} size="md" />
      <Atoms.Container className="min-w-0 flex-1 items-start">
        <Atoms.Typography className="truncate text-sm leading-5 font-bold whitespace-nowrap" overrideDefaults>
          {userName}
        </Atoms.Typography>
        <Atoms.Typography
          className="text-xs leading-4 font-medium tracking-[1.2px] whitespace-pre-wrap text-muted-foreground uppercase"
          overrideDefaults
        >
          {formattedPublicKey}
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}
