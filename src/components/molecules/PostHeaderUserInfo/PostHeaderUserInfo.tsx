'use client';

import { useMemo } from 'react';
import * as Config from '@/config';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { PostHeaderUserInfoProps } from './PostHeaderUserInfo.types';

export function PostHeaderUserInfo({
  userId,
  userName,
  avatarUrl,
  characterLimit,
  showPopover = true,
}: PostHeaderUserInfoProps) {
  const formattedPublicKey = useMemo(
    () => Libs.formatPublicKey({ key: userId, length: Config.POST_HEADER_PUBLIC_KEY_LENGTH }),
    [userId],
  );

  const content = (
    <Atoms.Container overrideDefaults className="flex min-w-0 gap-3">
      <Molecules.AvatarWithFallback avatarUrl={avatarUrl} name={userName} size="default" />
      <Atoms.Container overrideDefaults className="min-w-0 flex-1">
        <Atoms.Typography
          className="inline-block cursor-pointer truncate leading-none font-bold text-foreground hover:underline"
          overrideDefaults
        >
          {userName}
        </Atoms.Typography>
        <Atoms.Container overrideDefaults className="flex min-w-0 items-center gap-2">
          <Atoms.Typography
            className="text-xs leading-4 font-medium tracking-[0.075rem] whitespace-nowrap text-muted-foreground uppercase"
            overrideDefaults
          >
            @{formattedPublicKey}
          </Atoms.Typography>
          {characterLimit && (
            <Atoms.Typography
              className="shrink-0 text-xs leading-4 font-medium tracking-[0.075rem] whitespace-nowrap text-muted-foreground"
              overrideDefaults
            >
              {characterLimit.count}/{characterLimit.max}
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );

  if (!showPopover) {
    return content;
  }

  return (
    <Molecules.PostHeaderUserInfoPopoverWrapper
      userId={userId}
      userName={userName}
      avatarUrl={avatarUrl}
      formattedPublicKey={formattedPublicKey}
    >
      {content}
    </Molecules.PostHeaderUserInfoPopoverWrapper>
  );
}
