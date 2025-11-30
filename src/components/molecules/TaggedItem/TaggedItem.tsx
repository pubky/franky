'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import type { TaggedItemProps } from './TaggedItem.types';
import { MAX_VISIBLE_AVATARS } from './TaggedItem.constants';

export function TaggedItem({ tag, onTagClick, onSearchClick }: TaggedItemProps) {
  const visibleTaggers = tag.taggers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = tag.taggers.length - MAX_VISIBLE_AVATARS;

  const handleTagClick = () => {
    onTagClick(tag);
  };

  return (
    <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
      {/* Tag badge - clickable to toggle */}
      <Atoms.Tag
        name={tag.label}
        count={tag.taggers_count}
        onClick={handleTagClick}
        className={Libs.cn(
          'cursor-pointer transition-opacity hover:opacity-80',
          tag.relationship && 'ring-2 ring-brand',
        )}
      />

      {/* Search button */}
      <Atoms.Button variant="secondary" size="icon" onClick={onSearchClick}>
        <Libs.Search size={16} className="text-secondary-foreground" />
      </Atoms.Button>

      {/* Avatar group */}
      <Atoms.Container overrideDefaults={true} className="flex items-center pr-2 pl-0">
        {visibleTaggers.map((tagger, index) => (
          <Molecules.AvatarWithFallback
            key={tagger.id}
            name={tagger.id}
            avatarUrl={tagger.avatarUrl}
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
