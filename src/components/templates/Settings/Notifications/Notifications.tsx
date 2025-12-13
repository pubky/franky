'use client';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export function Notifications() {
  return (
    <Molecules.SettingsSectionCard
      icon={Libs.Bell}
      title="Platform notifications"
      description="Please select which notifications you want to receive on Pubky."
    >
      <Organisms.NotificationSettings />
    </Molecules.SettingsSectionCard>
  );
}
