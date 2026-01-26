'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Core from '@/core';
import { useListboxNavigation } from '@/hooks/useListboxNavigation';
import { TAG_SEARCH_DEBOUNCE_MS, TAG_SEARCH_LIMIT } from './useSuggestedTags.constants';
import type { UseSuggestedTagsOptions, UseSuggestedTagsResult } from './useSuggestedTags.types';

/**
 * Hook for fetching tag suggestions based on user input prefix.
 * Uses useListboxNavigation for keyboard navigation.
 *
 * @example
 * ```tsx
 * const {
 *   suggestedTags,
 *   selectedIndex,
 *   handleKeyDown,
 *   handleTagClick,
 * } = useSuggestedTags({
 *   tagInput: inputValue,
 *   onTagSelect: (tag) => setInputValue(tag),
 * });
 * ```
 */
export function useSuggestedTags({
  tagInput,
  onTagSelect,
  debounceMs = TAG_SEARCH_DEBOUNCE_MS,
  limit = TAG_SEARCH_LIMIT,
}: UseSuggestedTagsOptions): UseSuggestedTagsResult {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Track if search should be locked (after selection)
  const [searchLocked, setSearchLocked] = useState(false);
  const lastSelectedTag = useRef<string>('');

  // Handle tag selection (used by both click and keyboard)
  const handleTagSelect = useCallback(
    (tag: string) => {
      setSearchLocked(true);
      lastSelectedTag.current = tag;
      onTagSelect?.(tag);
      setIsOpen(false);
      setSuggestedTags([]);
    },
    [onTagSelect],
  );

  // Close suggestions dropdown
  const closeSuggestions = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Use generic listbox navigation hook
  const { selectedIndex, handleKeyDown, resetSelection } = useListboxNavigation({
    items: suggestedTags,
    isOpen,
    onSelect: handleTagSelect,
    onClose: closeSuggestions,
  });

  // Unlock search if input changes from last selected tag
  useEffect(() => {
    if (searchLocked && tagInput !== lastSelectedTag.current) {
      setSearchLocked(false);
    }
  }, [tagInput, searchLocked]);

  // Fetch suggestions when input changes
  useEffect(() => {
    // Don't search if locked (just selected a tag)
    if (searchLocked) {
      setSuggestedTags([]);
      setIsOpen(false);
      return;
    }

    // Don't search if input is empty
    const trimmedInput = tagInput.trim();
    if (!trimmedInput) {
      setSuggestedTags([]);
      setIsOpen(false);
      return;
    }

    let isActive = true;

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await Core.SearchController.getTagsByPrefix({
          prefix: trimmedInput,
          skip: 0,
          limit,
        });

        if (isActive) {
          // Filter out exact match (user is already typing it)
          const filtered = results.filter((tag) => tag.toLowerCase() !== trimmedInput.toLowerCase());
          setSuggestedTags(filtered);
          setIsOpen(filtered.length > 0);
          resetSelection();
        }
      } catch {
        if (isActive) {
          setSuggestedTags([]);
          setIsOpen(false);
        }
      } finally {
        if (isActive) {
          setIsSearching(false);
        }
      }
    }, debounceMs);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [tagInput, searchLocked, debounceMs, limit, resetSelection]);

  const clearSuggestions = useCallback(() => {
    setSuggestedTags([]);
    setIsOpen(false);
  }, []);

  return {
    suggestedTags,
    selectedIndex,
    isSearching,
    handleKeyDown,
    handleTagClick: handleTagSelect,
    clearSuggestions,
  };
}
