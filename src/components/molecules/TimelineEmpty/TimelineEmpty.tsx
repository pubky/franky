'use client';

import { useTranslations } from 'next-intl';
import * as Atoms from '@/atoms';

/**
 * TimelineEmpty
 *
 * Message displayed when timeline has no posts.
 */
export function TimelineEmpty() {
  const t = useTranslations('empty');

  return (
    <Atoms.Container className="flex items-center justify-center py-8">
      <Atoms.Typography size="md" className="text-muted-foreground">
        {t('noPosts')}
      </Atoms.Typography>
    </Atoms.Container>
  );
}
