'use client';

import * as Atoms from '@/atoms';
import type { SearchHeaderProps } from './SearchHeader.types';

/**
 * Search Header Component
 *
 * Displays the current search tags as a simple title above the search results.
 * Uses the same styling as FilterHeader (font-light text-muted-foreground).
 */
export function SearchHeader({ tags }: SearchHeaderProps) {
  return (
    <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
      Results for: {tags.join(', ')}
    </Atoms.Heading>
  );
}
