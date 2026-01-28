'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import type { TaggedListProps } from './TaggedList.types';

export function TaggedList({ tags, hasMore = false, isLoadingMore = false, onLoadMore, onTagToggle }: TaggedListProps) {
  // Track which tag is currently expanded (only one at a time - accordion behavior)
  const [expandedTagLabel, setExpandedTagLabel] = useState<string | null>(null);

  const { sentinelRef } = Hooks.useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    hasMore,
    isLoading: isLoadingMore,
    threshold: 200,
    debounceMs: 300,
  });

  const handleExpandToggle = (tagLabel: string) => {
    // Toggle: if clicking the same tag, collapse it; otherwise expand the new one
    setExpandedTagLabel((prev) => (prev === tagLabel ? null : tagLabel));
  };

  return (
    <Atoms.Container className="gap-2">
      {tags.map((tag) => (
        <Molecules.TaggedItem
          key={tag.label}
          tag={tag}
          onTagClick={onTagToggle}
          isExpanded={expandedTagLabel === tag.label}
          onExpandToggle={handleExpandToggle}
        />
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
