'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import type { HotTagCardProps, AvatarGroupProps } from './HotTagCard.types';

/**
 * AvatarGroup
 *
 * Displays a stack of overlapping avatars with a count indicator for overflow.
 * The overflow number is based on totalCount (e.g., post count), not the number of taggers.
 */
function AvatarGroup({ taggers, totalCount, maxAvatars = 6, className }: AvatarGroupProps) {
  const visibleTaggers = taggers.slice(0, maxAvatars);

  // Overflow is based on totalCount (posts) minus visible avatars
  const overflowCount = Math.max(0, totalCount - visibleTaggers.length);

  // Cap display at +99 for UI consistency
  const displayOverflow = overflowCount > 99 ? '+99' : `+${overflowCount}`;

  if (taggers.length === 0) return null;

  return (
    <Atoms.Container overrideDefaults className={Libs.cn('flex items-center', className)}>
      {visibleTaggers.map((tagger, index) => (
        <div
          key={tagger.id}
          className="relative rounded-full shadow-sm"
          style={{ marginLeft: index === 0 ? 0 : '-8px', zIndex: visibleTaggers.length - index }}
        >
          <Molecules.AvatarWithFallback avatarUrl={tagger.avatarUrl} name={tagger.name || 'User'} size="md" />
        </div>
      ))}
      {overflowCount > 0 && (
        <div
          className="relative flex size-8 items-center justify-center rounded-full bg-background text-sm font-medium shadow-sm"
          style={{ marginLeft: '-8px', zIndex: 0 }}
        >
          {displayOverflow}
        </div>
      )}
    </Atoms.Container>
  );
}

/**
 * HotTagCard
 *
 * A featured card displaying a trending tag with its rank, post count, and top taggers.
 * Used in the Hot Tags section to highlight the top 3 trending tags.
 */
export function HotTagCard({
  rank,
  tagName,
  postCount,
  taggers = [],
  maxAvatars = 6,
  onClick,
  className,
  'data-testid': dataTestId,
}: HotTagCardProps) {
  const tagColor = React.useMemo(() => Libs.generateRandomColor(tagName), [tagName]);

  const handleClick = () => {
    onClick?.(tagName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(tagName);
    }
  };

  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn(
        'relative flex min-w-0 flex-1 cursor-pointer flex-col gap-4 overflow-hidden rounded-md px-0 py-6 shadow-sm transition-opacity hover:opacity-90',
        className,
      )}
      style={{
        background: `linear-gradient(90deg, rgba(5, 5, 10, 0.7) 0%, rgba(5, 5, 10, 0.7) 100%), ${tagColor}`,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      data-testid={dataTestId || `hot-tag-card-${rank}`}
    >
      {/* Card Content */}
      <Atoms.Container overrideDefaults className="flex flex-col gap-2.5 px-6">
        {/* Rank and Tag Name */}
        <Atoms.Container overrideDefaults className="flex items-center gap-3">
          <Atoms.Container
            overrideDefaults
            className="flex size-6 shrink-0 items-center justify-center rounded-full border border-accent-foreground"
          >
            <Atoms.Typography size="sm" className="font-bold">
              {rank}
            </Atoms.Typography>
          </Atoms.Container>
          <Atoms.Typography size="lg" className="truncate text-2xl font-bold">
            {tagName}
          </Atoms.Typography>
        </Atoms.Container>

        {/* Post Count */}
        <Atoms.Typography size="md" className="text-secondary-foreground">
          {postCount.toLocaleString()} posts
        </Atoms.Typography>
      </Atoms.Container>

      {/* Card Footer - Avatar Group */}
      <Atoms.Container overrideDefaults className="px-6">
        <AvatarGroup taggers={taggers} totalCount={postCount} maxAvatars={maxAvatars} />
      </Atoms.Container>
    </Atoms.Container>
  );
}
