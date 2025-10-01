'use client';

import { useEffect, useState } from 'react';
import * as Libs from '@/libs';

export interface FilterDrawerProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export function FilterDrawer({ open, onOpenChangeAction, children, position = 'left' }: FilterDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => setAnimateIn(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setAnimateIn(false);
      const timeout = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!isVisible) return null;

  const positionClasses = position === 'left' ? 'left-0 border-r border-white' : 'right-0 border-l border-white';

  const widthClasses =
    position === 'left' ? 'w-[228px] sm:w-[228px] md:w-[385px]' : 'w-[280px] sm:w-[280px] md:w-[385px]';

  const translateClasses =
    position === 'left'
      ? animateIn
        ? 'translate-x-0'
        : '-translate-x-full'
      : animateIn
        ? 'translate-x-0'
        : 'translate-x-full';

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={Libs.cn(
          'absolute inset-0 bg-black transition-opacity duration-300',
          animateIn ? 'bg-opacity-50' : 'bg-opacity-0',
        )}
        onClick={() => onOpenChangeAction(false)}
      />

      {/* Drawer */}
      <div
        className={Libs.cn(
          'fixed top-0 h-full z-50',
          'bg-background p-4 sm:p-4 md:p-12 shadow-xl',
          'transition-transform duration-300 ease-in-out',
          widthClasses,
          positionClasses,
          translateClasses,
        )}
      >
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
