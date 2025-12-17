'use client';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import type { SearchInputProps } from './SearchInput.types';
import { SEARCH_EXPANDED_STYLE } from './SearchInput.constants';

export function SearchInput({ defaultExpanded = false }: SearchInputProps) {
  const { inputValue, isFocused, containerRef, handleInputChange, handleKeyDown, handleFocus, handleTagClick } =
    Hooks.useSearchInput({ defaultExpanded });

  const { tags: hotTags } = Hooks.useHotTags({ limit: 8 });

  return (
    <Atoms.Container ref={containerRef} data-testid="search-input" className="relative">
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
          placeholder="Search"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="h-full flex-1 border-none py-0 pr-10 pl-6 font-medium text-foreground"
        />
        <Libs.Search className="pointer-events-none mr-4 size-4 text-muted-foreground" aria-hidden="true" />
      </Atoms.Container>

      {/* Suggestions dropdown */}
      {isFocused && hotTags.length > 0 && <Molecules.SearchSuggestions hotTags={hotTags} onTagClick={handleTagClick} />}
    </Atoms.Container>
  );
}
