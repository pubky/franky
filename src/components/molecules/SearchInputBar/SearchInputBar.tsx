'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { SEARCH_EXPANDED_STYLE } from '@/config/search';
import type { SearchInputBarProps } from './SearchInputBar.types';

export function SearchInputBar({
  activeTags,
  inputValue,
  isFocused,
  isReadOnly,
  isExpanded,
  suggestionsId,
  inputRef,
  onTagRemove,
  onInputChange,
  onKeyDown,
  onFocus,
}: SearchInputBarProps) {
  const hasActiveTags = activeTags.length > 0;

  return (
    <Atoms.Container
      data-testid="search-input-bar"
      className={Libs.cn(
        'relative flex min-h-12 items-center gap-3 border border-border px-6 py-3',
        isFocused ? 'rounded-t-2xl border-b-transparent' : 'rounded-full',
      )}
      style={isFocused ? SEARCH_EXPANDED_STYLE : undefined}
      overrideDefaults
    >
      {hasActiveTags && (
        <Atoms.Container
          overrideDefaults
          className="flex shrink-0 items-center gap-2.5 py-2"
          role="list"
          aria-label="Active search tags"
        >
          {activeTags.map((tag) => (
            <Molecules.PostTag key={tag} label={tag} showClose onClose={() => onTagRemove(tag)} />
          ))}
        </Atoms.Container>
      )}

      <Atoms.Input
        ref={inputRef}
        type="text"
        placeholder={hasActiveTags ? '' : 'Search'}
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        readOnly={isReadOnly}
        data-cy="header-search-input"
        aria-label="Search input"
        aria-autocomplete="list"
        aria-controls={suggestionsId || undefined}
        aria-expanded={isExpanded}
        aria-haspopup={suggestionsId ? 'dialog' : undefined}
        className={Libs.cn(
          'min-w-20 flex-1 border-none bg-transparent pr-0 text-base font-medium text-foreground md:text-base',
          hasActiveTags ? 'pl-2.5' : 'pl-0',
        )}
      />

      {/* Search icon */}
      <Libs.Search className="pointer-events-none size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Atoms.Container>
  );
}
