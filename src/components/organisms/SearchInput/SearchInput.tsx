'use client';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import type { SearchInputProps } from './SearchInput.types';
import { SEARCH_EXPANDED_STYLE } from './SearchInput.constants';

export function SearchInput({ placeholder = 'Search', defaultExpanded = false }: SearchInputProps) {
  const { inputValue, isFocused, containerRef, handleInputChange, handleKeyDown, handleFocus, handleTagClick } =
    Hooks.useSearchInput({ defaultExpanded });

  const { tags: hotTags } = Hooks.useHotTags({ limit: 8 });

  // Transform hot tags to SearchTag format
  const hotTagsFormatted = hotTags.map((tag) => ({ label: tag.name }));

  return (
    <Atoms.Container ref={containerRef} data-testid="search-input" className="relative w-full" overrideDefaults>
      {/* Input */}
      <Atoms.Container
        className={Libs.cn(
          'relative flex h-12 items-center border border-border',
          isFocused ? 'rounded-t-2xl border-b-transparent' : 'rounded-full',
        )}
        style={isFocused ? SEARCH_EXPANDED_STYLE : undefined}
        overrideDefaults
      >
        <Atoms.Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="h-full flex-1 border-none bg-transparent px-6 py-0 pr-10 text-base font-medium text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
        />
        <Libs.Search
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </Atoms.Container>

      {/* Suggestions dropdown */}
      {isFocused && hotTagsFormatted.length > 0 && (
        <Molecules.SearchSuggestions hotTags={hotTagsFormatted} onTagClick={handleTagClick} />
      )}
    </Atoms.Container>
  );
}
