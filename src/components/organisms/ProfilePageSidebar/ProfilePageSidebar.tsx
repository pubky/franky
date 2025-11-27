'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Core from '@/core';

export function ProfilePageSidebar() {
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);
  const { userDetails } = Hooks.useCurrentUserProfile();
  const tags = Hooks.useUserTags(currentUserPubky);

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-(--header-height) hidden w-(--filter-bar-width) flex-col gap-6 self-start lg:flex"
    >
      <Molecules.ProfilePageTaggedAs tags={tags?.map((tag) => ({ name: tag.label, count: tag.taggers_count })) ?? []} />
      <Molecules.ProfilePageLinks links={userDetails?.links} />
      <Organisms.FeedbackCard />
    </Atoms.Container>
  );
}
