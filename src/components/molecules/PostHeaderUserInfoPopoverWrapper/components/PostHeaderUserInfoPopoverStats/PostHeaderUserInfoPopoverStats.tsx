'use client';

import { useTranslations } from 'next-intl';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { PostHeaderUserInfoPopoverStatsProps } from './PostHeaderUserInfoPopoverStats.types';

export function PostHeaderUserInfoPopoverStats({
  followersCount,
  followingCount,
  followersAvatars,
  followingAvatars,
  maxAvatars,
}: PostHeaderUserInfoPopoverStatsProps) {
  const t = useTranslations('userList');

  return (
    <Atoms.Container className="flex items-start gap-2.5" overrideDefaults>
      <Atoms.Container className="flex-1 items-start gap-2">
        <Atoms.Typography
          className="text-xs leading-4 font-medium tracking-[1.2px] whitespace-pre-wrap text-muted-foreground uppercase"
          overrideDefaults
        >
          <Atoms.Typography as="span" className="text-foreground" overrideDefaults>
            {followersCount}
          </Atoms.Typography>{' '}
          {t('followers')}
        </Atoms.Typography>
        {followersAvatars.length > 0 ? (
          <Molecules.AvatarGroup items={followersAvatars} totalCount={followersCount} maxAvatars={maxAvatars} />
        ) : null}
      </Atoms.Container>

      <Atoms.Container className="flex-1 items-start gap-2">
        <Atoms.Typography
          className="text-xs leading-4 font-medium tracking-[1.2px] whitespace-pre-wrap text-muted-foreground uppercase"
          overrideDefaults
        >
          <Atoms.Typography as="span" className="text-foreground" overrideDefaults>
            {followingCount}
          </Atoms.Typography>{' '}
          {t('followingLabel')}
        </Atoms.Typography>
        {followingAvatars.length > 0 ? (
          <Molecules.AvatarGroup items={followingAvatars} totalCount={followingCount} maxAvatars={maxAvatars} />
        ) : null}
      </Atoms.Container>
    </Atoms.Container>
  );
}
