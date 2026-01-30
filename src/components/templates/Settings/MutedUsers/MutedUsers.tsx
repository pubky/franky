'use client';

import { useTranslations } from 'next-intl';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export function MutedUsers() {
  const t = useTranslations('settings.mutedUsers');

  return (
    <Molecules.SettingsSectionCard icon={Libs.MegaphoneOff} title={t('title')} description={t('description')}>
      <Organisms.MutedUsersList />
    </Molecules.SettingsSectionCard>
  );
}
