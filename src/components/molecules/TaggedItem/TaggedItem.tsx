'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import type { NexusTag } from '@/core/services/nexus/nexus.types';

export interface TaggedItemProps {
  /** Tag data */
  tag: NexusTag;
  /** Callback when search button is clicked */
  onSearchClick?: () => void;
}

export function TaggedItem({ tag, onSearchClick }: TaggedItemProps) {
  // Show first 3-4 avatars, then overflow indicator
  const MAX_VISIBLE_AVATARS = 4;
  const visibleTaggers = tag.taggers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = tag.taggers.length - MAX_VISIBLE_AVATARS;

  return (
    <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
      {/* Tag badge */}
      <Atoms.Tag name={tag.label} count={tag.taggers_count} />

      {/* Search button */}
      <Atoms.Button variant="secondary" size="icon" onClick={onSearchClick}>
        <Libs.Search size={16} className="text-secondary-foreground" />
      </Atoms.Button>

      {/* Avatar group */}
      <Atoms.Container overrideDefaults={true} className="flex items-center pr-2 pl-0">
        {visibleTaggers.map((taggerId, index) => (
          <Molecules.AvatarWithFallback
            key={taggerId}
            name={taggerId}
            className={Libs.cn('h-8 w-8 shrink-0', index > 0 && '-ml-2')}
          />
        ))}
        {overflowCount > 0 && (
          <Atoms.Container
            overrideDefaults={true}
            className={Libs.cn(
              'flex shrink-0 items-center justify-center rounded-full bg-background shadow-sm',
              'h-8 w-8 text-xs font-medium text-foreground',
              visibleTaggers.length > 0 && '-ml-2',
            )}
          >
            +{overflowCount}
          </Atoms.Container>
        )}
      </Atoms.Container>
    </Atoms.Container>
  );
}
