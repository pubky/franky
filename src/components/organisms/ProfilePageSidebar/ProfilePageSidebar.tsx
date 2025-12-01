'use client';

import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Core from '@/core';

export function ProfilePageSidebar() {
  const pathname = usePathname();
  const currentUserPubky = Core.useAuthStore().selectCurrentUserPubky();
  const { userDetails } = Hooks.useCurrentUserProfile();
  const {
    tags,
    isLoading: isLoadingTags,
    handleTagToggle,
  } = Hooks.useTagged(currentUserPubky, {
    enablePagination: false,
    enableStats: false,
  });

  const isTaggedPage = pathname?.endsWith('/tagged');

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-(--header-height) hidden w-(--filter-bar-width) flex-col gap-6 self-start lg:flex"
    >
      {!isTaggedPage && (
        <Molecules.ProfilePageTaggedAs tags={tags} isLoading={isLoadingTags} onTagClick={handleTagToggle} />
      )}
      <Molecules.ProfilePageLinks links={userDetails?.links} />
      <Organisms.FeedbackCard />
    </Atoms.Container>
  );
}
