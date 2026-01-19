'use client';

import * as Molecules from '@/molecules';

export function Help() {
  return (
    <Molecules.SettingsSectionCard wrapChildren={false}>
      <Molecules.HelpContent />
    </Molecules.SettingsSectionCard>
  );
}
