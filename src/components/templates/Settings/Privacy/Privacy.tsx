'use client';

import { useTranslations } from 'next-intl';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export function Privacy() {
  const t = useTranslations('settings.privacy');

  return (
    <Molecules.SettingsSectionCard icon={Libs.Shield} title={t('title')} description={t('description')}>
      <Organisms.PrivacySettings />
    </Molecules.SettingsSectionCard>
  );
}
