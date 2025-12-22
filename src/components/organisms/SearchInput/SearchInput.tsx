'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import { APP_ROUTES } from '@/app/routes';
import { CLICKABLE_TAGS_DEFAULT_MAX_LENGTH } from '@/config/tags';
import { parseTagsFromUrl } from './SearchInput.utils';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { addTagToSearch, removeTagFromSearch, activeTags, isReadOnly } = Hooks.useTagSearch();
  const { setActiveTags, recentUsers, recentTags, addUser, clearRecentSearches } = Core.useSearchStore();

  const handleEnter = (value: string) => {
    addTagToSearch(value, { addToRecent: true });
    if (pathname !== APP_ROUTES.SEARCH) {
      setFocus(false);
    }
  };

  const {
    inputValue,
    isFocused,
    containerRef,
    inputRef,
    handleInputChange,
    handleKeyDown,
    handleFocus,
    clearInputValue,
    setFocus,
  } = Hooks.useSearchInput({ onEnter: handleEnter });

  const tagsParam = searchParams.get('tags');
  useEffect(() => {
    const urlTags = parseTagsFromUrl(tagsParam);
    setActiveTags(urlTags);
  }, [tagsParam, setActiveTags]);

  const { tags: hotTags } = Hooks.useHotTags({ limit: CLICKABLE_TAGS_DEFAULT_MAX_LENGTH });

  const hasInput = inputValue.trim().length > 0;
  const { tags: autocompleteTags, users: autocompleteUserData } = Hooks.useSearchAutocomplete({
    query: inputValue,
    enabled: isFocused && hasInput,
  });

  const handleUserClick = (userId: Core.Pubky) => {
    addUser(userId);
    clearInputValue();
    setFocus(false);
    router.push(`/profile/${userId}/posts`);
  };

  const handleTagClick = (tag: string) => {
    addTagToSearch(tag, { addToRecent: true });
    clearInputValue();
    if (pathname !== APP_ROUTES.SEARCH) {
      setFocus(false);
    }
  };

  const hasRecentContent = hotTags.length > 0 || recentUsers.length > 0 || recentTags.length > 0;
  const hasSuggestions = isFocused && (hasInput || hasRecentContent);

  const suggestionsId = 'search-suggestions-listbox';

  return (
    <Atoms.Container
      ref={containerRef}
      data-testid="search-input"
      className="relative"
      role="combobox"
      aria-expanded={hasSuggestions}
      aria-haspopup="listbox"
      aria-owns={hasSuggestions ? suggestionsId : undefined}
    >
      {/* Input bar with active tags */}
      <Molecules.SearchInputBar
        activeTags={activeTags}
        inputValue={inputValue}
        isFocused={isFocused}
        isReadOnly={isReadOnly}
        suggestionsId={hasSuggestions ? suggestionsId : undefined}
        inputRef={inputRef}
        onTagRemove={removeTagFromSearch}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />

      {/* Suggestions dropdown */}
      {hasSuggestions && (
        <Molecules.SearchSuggestions
          id={suggestionsId}
          role="listbox"
          aria-label="Search suggestions"
          hotTags={hotTags}
          inputValue={inputValue}
          hasInput={hasInput}
          autocompleteTags={autocompleteTags}
          autocompleteUsers={autocompleteUserData}
          recentUsers={recentUsers}
          recentTags={recentTags}
          onTagClick={handleTagClick}
          onUserClick={handleUserClick}
          onSearchAsTagClick={handleTagClick}
          onClearRecentSearches={clearRecentSearches}
        />
      )}
    </Atoms.Container>
  );
}
