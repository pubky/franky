'use client';

import { useTranslations } from 'next-intl';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export function Notifications() {
  const t = useTranslations('settings.notifications');

  return (
    <Molecules.SettingsSectionCard icon={Libs.Bell} title={t('title')} description={t('description')}>
      <Organisms.NotificationSettings />
    </Molecules.SettingsSectionCard>
  );
}
