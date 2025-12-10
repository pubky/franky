'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import type { TaggedListProps } from './TaggedList.types';

export function TaggedList({ tags, hasMore = false, isLoadingMore = false, onLoadMore, onTagToggle }: TaggedListProps) {
  const { sentinelRef } = Hooks.useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    hasMore,
    isLoading: isLoadingMore,
    threshold: 200,
    debounceMs: 300,
  });

  return (
    <Atoms.Container className="gap-2">
      {tags.map((tag, index) => (
        <Molecules.TaggedItem key={`${tag.label}_${index}`} tag={tag} onTagClick={onTagToggle} />
      ))}
      {hasMore && (
        <Atoms.Container overrideDefaults ref={sentinelRef} className="h-4 w-full">
          {isLoadingMore && (
            <Atoms.Typography as="p" className="text-center text-sm text-muted-foreground">
              Loading more tags...
            </Atoms.Typography>
          )}
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
