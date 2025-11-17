'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export interface ProfilePageSidebarProps {
  tags?: Array<{ name: string; count?: number }>;
  links?: Molecules.ProfilePageSidebarLink[];
}

export function ProfilePageSidebar({ tags, links }: ProfilePageSidebarProps) {
  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-[calc(var(--header-height)+var(--profile-header-height))] hidden w-[180px] flex-col gap-6 self-start lg:flex"
    >
      <Molecules.ProfilePageTaggedAs tags={tags} />
      <Molecules.ProfilePageLinks links={links} />
      <Molecules.FeedbackCard />
    </Atoms.Container>
  );
}
