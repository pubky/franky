'use client';

import * as Molecules from '@/molecules';

export interface ProfilePageSidebarProps {
  tags?: Array<{ name: string; count?: number }>;
  links?: Molecules.ProfilePageSidebarLink[];
}

export function ProfilePageSidebar({ tags, links }: ProfilePageSidebarProps) {
  return (
    <div className="sticky top-[338px] hidden w-[180px] flex-col gap-6 lg:flex">
      <Molecules.ProfilePageTaggedAs tags={tags} />
      <Molecules.ProfilePageLinks links={links} />
      <Molecules.FeedbackCard />
    </div>
  );
}
