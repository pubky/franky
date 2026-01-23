'use client';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

export function MutedUsers() {
  return (
    <Molecules.SettingsSectionCard
      icon={Libs.MegaphoneOff}
      title="Muted users"
      description="Here is an overview of all users you muted. You can choose to unmute users if you want."
    >
      <Organisms.MutedUsersList />
    </Molecules.SettingsSectionCard>
  );
}
