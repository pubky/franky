'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/app/routes';
import type { TaggedItemProps } from './TaggedItem.types';
import { MAX_VISIBLE_AVATARS } from './TaggedItem.constants';

export function TaggedItem({ tag, onTagClick, onSearchClick, maxTagLength, hideAvatars = false }: TaggedItemProps) {
  const router = useRouter();
  const visibleTaggers = tag.taggers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = tag.taggers.length - MAX_VISIBLE_AVATARS;
  const displayLabel = maxTagLength ? Libs.truncateString(tag.label, maxTagLength) : tag.label;

  const handleTagClick = () => {
    onTagClick(tag);
  };

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      // Default behavior: navigate to search with tag filter
      const searchParams = new URLSearchParams();
      searchParams.set('tags', tag.label);
      router.push(`${APP_ROUTES.SEARCH}?${searchParams.toString()}`);
    }
  };

  return (
    <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
      {/* Tag badge with count - clickable to toggle */}
      <Atoms.Tag
        name={displayLabel}
        count={tag.taggers_count}
        clicked={!!tag.relationship}
        onClick={handleTagClick}
        className="max-w-[160px] cursor-pointer transition-opacity hover:opacity-80"
      />

      {/* Search button */}
      <Atoms.Button variant="secondary" size="icon" onClick={handleSearchClick}>
        <Libs.Search size={16} className="text-secondary-foreground" />
      </Atoms.Button>

      {/* Avatar group - hidden in compact mode */}
      {!hideAvatars && (
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
      )}
    </Atoms.Container>
  );
}
