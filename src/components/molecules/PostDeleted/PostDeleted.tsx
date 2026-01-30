'use client';

import { useTranslations } from 'next-intl';
import * as Atoms from '@/atoms';

export const PostDeleted = () => {
  const t = useTranslations('post');

  return (
    <Atoms.CardContent className="py-2">
      <Atoms.Typography size="sm" className="text-center font-normal text-muted-foreground">
        {t('deleted')}
      </Atoms.Typography>
    </Atoms.CardContent>
  );
};
