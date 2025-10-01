'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface MobileHeaderProps {
  onLeftIconClick?: () => void;
  className?: string;
}

export function MobileHeader({ onLeftIconClick, className }: MobileHeaderProps) {
  const [drawerSidebarOpen, setDrawerSidebarOpen] = useState(false);

  return (
    <>
      <div
        className={Libs.cn(
          'lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/20',
          className,
        )}
      >
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left icon - filters */}
          <button onClick={onLeftIconClick} className="p-2 hover:bg-secondary/10 rounded-full transition-colors">
            <Libs.SlidersHorizontal className="h-6 w-6" />
          </button>

          {/* Center - Logo */}
          <div className="flex items-center gap-2">
            <Atoms.Typography size="md" className="font-bold">
              Pubky
            </Atoms.Typography>
          </div>

          {/* Right icon - community info */}
          <button
            onClick={() => setDrawerSidebarOpen(true)}
            className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
          >
            <Libs.Users className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Right drawer for community info */}
      <Molecules.FilterDrawer open={drawerSidebarOpen} onOpenChangeAction={setDrawerSidebarOpen} position="right">
        <div className="flex flex-col gap-6">
          <Molecules.WhoToFollow />
          <Molecules.ActiveUsers />
          <Molecules.FeedbackCard />
        </div>
      </Molecules.FilterDrawer>
    </>
  );
}
