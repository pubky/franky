'use client';

import { useTranslations } from 'next-intl';
import * as Atoms from '@/atoms';
import type { SearchHeaderProps } from './SearchHeader.types';

/**
 * Search Header Component
 *
 * Displays the current search tags as a simple title above the search results.
 * Uses the same styling as FilterHeader (font-light text-muted-foreground).
 *
 * @returns null if tags array is empty (defensive check)
 */
export function SearchHeader({ tags }: SearchHeaderProps) {
  const t = useTranslations('search');

  if (tags.length === 0) {
    return null;
  }

  return (
    <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
      {t('results', { tags: tags.join(', ') })}
    </Atoms.Heading>
  );
}
