'use client';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface MobileHeaderProps {
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  showLeftButton?: boolean;
  showRightButton?: boolean;
  className?: string;
}

export function MobileHeader({
  onLeftIconClick,
  onRightIconClick,
  showLeftButton = true,
  showRightButton = true,
  className,
}: MobileHeaderProps) {
  return (
    <div className={Libs.cn('lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-sm', className)}>
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left icon - filters */}
        {showLeftButton ? (
          <button onClick={onLeftIconClick} className="p-2 hover:bg-secondary/10 rounded-full transition-colors">
            <Libs.SlidersHorizontal className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        {/* Center - Logo */}
        <Molecules.Logo />

        {/* Right icon - community info */}
        {showRightButton ? (
          <button onClick={onRightIconClick} className="p-2 hover:bg-secondary/10 rounded-full transition-colors">
            <Libs.Activity className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </div>
  );
}
