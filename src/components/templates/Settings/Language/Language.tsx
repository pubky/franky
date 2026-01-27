'use client';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export function Language() {
  return (
    <Molecules.SettingsSectionCard
      icon={Libs.Globe}
      title="Language"
      description="Choose your preferred language for the Pubky interface."
    >
      <Organisms.LanguageSelector />
    </Molecules.SettingsSectionCard>
  );
}
