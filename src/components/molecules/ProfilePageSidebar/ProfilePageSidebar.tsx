'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export interface ProfilePageSidebarProps {
  tags?: Array<{ name: string; count?: number }>;
  links?: Molecules.ProfilePageSidebarLink[];
}

export function ProfilePageSidebar({ tags, links }: ProfilePageSidebarProps) {
  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-(--header-height) hidden w-(--filter-bar-width) flex-col gap-6 self-start lg:flex"
    >
      <Molecules.ProfilePageTaggedAs tags={tags} />
      <Molecules.ProfilePageLinks links={links} />
      <Organisms.FeedbackCard />
    </Atoms.Container>
  );
}
