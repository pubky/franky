'use client';

import * as Atoms from '@/components/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface MobileHeaderProps {
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  showLeftButton?: boolean;
  showRightButton?: boolean;
}

export function MobileHeader({
  onLeftIconClick,
  onRightIconClick,
  showLeftButton = true,
  showRightButton = true,
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-background shadow-xs-dark lg:hidden">
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center justify-between py-3">
          {/* Left icon - filters */}
          {showLeftButton ? (
            <Atoms.Button variant="ghost" size="icon" onClick={onLeftIconClick}>
              <Libs.SlidersHorizontal className="h-6 w-6" />
            </Atoms.Button>
          ) : (
            <div />
          )}

          {/* Center - Logo */}
          <Molecules.Logo />

          {/* Right icon - community info */}
          {showRightButton ? (
            <Atoms.Button variant="ghost" size="icon" onClick={onRightIconClick}>
              <Libs.Activity className="h-6 w-6" />
            </Atoms.Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
