'use client';

import { useTranslations } from 'next-intl';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export function Language() {
  const t = useTranslations('settings.language');

  return (
    <Molecules.SettingsSectionCard icon={Libs.Globe} title={t('title')} description={t('description')}>
      <Organisms.LanguageSelector />
    </Molecules.SettingsSectionCard>
  );
}
