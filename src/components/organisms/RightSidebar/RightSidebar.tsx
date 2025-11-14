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
      className={Libs.cn('hidden w-[180px] flex-col items-start justify-start gap-6 lg:flex', className)}
    >
      <Molecules.WhoToFollow />
      <Molecules.ActiveUsers />
      <div className="sticky top-[100px] self-start">
        <Molecules.FeedbackCard />
      </div>
    </div>
  );
}
