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
    <div
      className={Libs.cn(
        'fixed top-0 right-0 left-0 z-30 border-b border-border/20 bg-background/80 backdrop-blur-sm lg:hidden',
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left icon - filters */}
        {showLeftButton ? (
          <button onClick={onLeftIconClick} className="rounded-full p-2 transition-colors hover:bg-secondary/10">
            <Libs.SlidersHorizontal className="h-6 w-6" />
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}

        {/* Center - Logo */}
        <Molecules.Logo />

        {/* Right icon - community info */}
        {showRightButton ? (
          <button onClick={onRightIconClick} className="rounded-full p-2 transition-colors hover:bg-secondary/10">
            <Libs.Activity className="h-6 w-6" />
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}
      </div>
    </div>
  );
}
