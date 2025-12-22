'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { SearchAsTagLinkProps } from './SearchAsTagLink.types';

/**
 * SearchAsTagLink
 *
 * Displays a link to search for the input query as a tag.
 * Navigates to the search page with the query as a tag parameter.
 */
export function SearchAsTagLink({ query, onClick }: SearchAsTagLinkProps) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return null;
  }

  return (
    <Atoms.Container
      overrideDefaults
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary"
      onClick={() => onClick(trimmedQuery)}
      data-testid="search-as-tag-link"
    >
      <Libs.Search className="size-4 text-muted-foreground" />
      <Atoms.Typography className="text-sm text-foreground" overrideDefaults>
        Search <span className="font-semibold">&apos;{trimmedQuery}&apos;</span> as tag
      </Atoms.Typography>
    </Atoms.Container>
  );
}
