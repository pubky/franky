'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as Core from '@/core';
import { APP_ROUTES } from '@/app/routes';
import { MAX_ACTIVE_SEARCH_TAGS } from '@/core/stores/search/search.constants';
import type { TagSearchOptions, UseTagSearchResult } from './useTagSearch.types';
import { buildSearchUrl, calculateNewTags } from './useTagSearch.utils';

export function useTagSearch(): UseTagSearchResult {
  const router = useRouter();
  const { activeTags, addActiveTag, removeActiveTag, addTag } = Core.useSearchStore();

  const addTagToSearch = useCallback(
    (tag: string, options?: TagSearchOptions) => {
      const normalizedTag = tag.trim().toLowerCase();
      if (normalizedTag.length === 0) return;

      if (options?.addToRecent) {
        addTag(normalizedTag);
      }

      // Calculate new tags using same logic as store
      const newTags = calculateNewTags(activeTags, normalizedTag);

      // Update store (store will handle deduplication and max limit)
      addActiveTag(normalizedTag);

      // Navigate with calculated tags
      router.push(buildSearchUrl(newTags));
    },
    [router, activeTags, addActiveTag, addTag],
  );

  const removeTagFromSearch = useCallback(
    (tag: string) => {
      const normalizedTag = tag.trim().toLowerCase();
      const newTags = activeTags.filter((t) => t !== normalizedTag);

      removeActiveTag(normalizedTag);

      if (newTags.length === 0) {
        router.push(APP_ROUTES.HOME);
      } else {
        router.push(buildSearchUrl(newTags));
      }
    },
    [router, activeTags, removeActiveTag],
  );

  const isReadOnly = activeTags.length >= MAX_ACTIVE_SEARCH_TAGS;

  return {
    addTagToSearch,
    removeTagFromSearch,
    activeTags,
    isReadOnly,
  };
}
