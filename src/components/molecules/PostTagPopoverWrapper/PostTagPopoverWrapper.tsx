'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import type { TaggerWithAvatar } from '@/molecules/TaggedItem/TaggedItem.types';
import type { PostTagPopoverWrapperProps } from './PostTagPopoverWrapper.types';
import { POPOVER_HOVER_DELAY, MAX_VISIBLE_AVATARS } from './PostTagPopoverWrapper.constants';
import { PostHeaderUserInfoPopoverContent } from '../PostHeaderUserInfoPopoverWrapper';

/**
 * PostTagPopoverWrapper
 *
 * Wraps a tag with hover tooltip showing tagger avatars.
 * Click on avatar opens user profile popover.
 */
export function PostTagPopoverWrapper({ taggers, taggersCount, children }: PostTagPopoverWrapperProps) {
  const [open, setOpen] = useState(false);

  if (taggers.length === 0 && taggersCount === 0) {
    return <>{children}</>;
  }

  const visibleTaggers = taggers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = Math.max(0, taggersCount - visibleTaggers.length);

  return (
    <Atoms.Popover hover hoverDelay={POPOVER_HOVER_DELAY} open={open} onOpenChange={setOpen}>
      <Atoms.PopoverTrigger asChild>{children}</Atoms.PopoverTrigger>
      <Atoms.PopoverContent
        side="bottom"
        sideOffset={4}
        align="start"
        className="w-auto border-none bg-transparent p-0 shadow-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Atoms.Container overrideDefaults className="flex items-center">
          {visibleTaggers.map((tagger, index) => (
            <TaggerAvatar key={tagger.id} tagger={tagger} index={index} total={visibleTaggers.length} />
          ))}
          {overflowCount > 0 && (
            <Atoms.Container
              overrideDefaults
              className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium shadow-sm"
              style={{ marginLeft: '-8px', zIndex: 0 }}
            >
              +{overflowCount}
            </Atoms.Container>
          )}
        </Atoms.Container>
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}

/**
 * TaggerAvatar
 *
 * Individual tagger avatar with click-to-open profile popover.
 */
function TaggerAvatar({ tagger, index, total }: { tagger: TaggerWithAvatar; index: number; total: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Atoms.Popover open={open} onOpenChange={setOpen}>
      <Atoms.PopoverTrigger asChild>
        <Atoms.Button
          overrideDefaults
          className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
          style={{ marginLeft: index === 0 ? 0 : '-8px', zIndex: total - index }}
        >
          <Organisms.AvatarWithFallback
            name={tagger.name ?? tagger.id}
            avatarUrl={tagger.avatarUrl}
            size="md"
            className="shrink-0 border-2 border-background shadow-sm"
          />
        </Atoms.Button>
      </Atoms.PopoverTrigger>
      <Atoms.PopoverContent
        side="top"
        sideOffset={8}
        align="start"
        className="mx-0 w-(--popover-width)"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {open && (
          <PostHeaderUserInfoPopoverContent
            userId={tagger.id}
            userName={tagger.name ?? ''}
            avatarUrl={tagger.avatarUrl}
            formattedPublicKey={Libs.formatPublicKey({ key: tagger.id })}
          />
        )}
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
