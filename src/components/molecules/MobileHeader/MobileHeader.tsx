'use client';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface MobileHeaderProps {
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  className?: string;
}

export function MobileHeader({ onLeftIconClick, onRightIconClick, className }: MobileHeaderProps) {
  return (
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
        <Molecules.Logo width={90} height={30} />

        {/* Right icon - community info */}
        <button onClick={onRightIconClick} className="p-2 hover:bg-secondary/10 rounded-full transition-colors">
          <Libs.Activity className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
