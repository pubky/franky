'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

export function ProfilePageSidebar() {
  const { userDetails } = Hooks.useCurrentUserProfile();

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-(--header-height) hidden w-(--filter-bar-width) flex-col gap-6 self-start lg:flex"
    >
      <Molecules.ProfilePageTaggedAs tags={[]} />
      <Molecules.ProfilePageLinks links={userDetails?.links} />
      <Organisms.FeedbackCard />
    </Atoms.Container>
  );
}
