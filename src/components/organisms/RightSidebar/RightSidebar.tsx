'use client';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface RightSidebarProps {
  className?: string;
}

export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <div
      data-testid="right-sidebar"
      className={Libs.cn('w-[180px] hidden lg:flex flex-col gap-6 justify-start items-start', className)}
    >
      <Molecules.WhoToFollow />
      <Molecules.ActiveUsers />
      <div className="self-start sticky top-[100px]">
        <Molecules.FeedbackCard />
      </div>
    </div>
  );
}
