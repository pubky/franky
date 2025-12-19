'use client';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export function Privacy() {
  return (
    <Molecules.SettingsSectionCard
      icon={Libs.ShieldCheck}
      title="Privacy and Safety"
      description="Privacy is not a crime. Manage your visibility and safety on Pubky."
    >
      <Organisms.PrivacySettings />
    </Molecules.SettingsSectionCard>
  );
}
