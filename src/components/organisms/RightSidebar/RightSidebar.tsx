'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';

export interface RightSidebarProps {
  className?: string;
}

export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <Atoms.Container
      overrideDefaults
      data-testid="right-sidebar"
      className={Libs.cn('hidden w-(--filter-bar-width) flex-col items-start justify-start gap-6 lg:flex', className)}
    >
      <Molecules.WhoToFollow />
      <Molecules.ActiveUsers />
      <Atoms.Container overrideDefaults className="sticky top-[100px] self-start">
        <Organisms.FeedbackCard />
      </Atoms.Container>
    </Atoms.Container>
  );
}
