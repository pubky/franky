'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ButtonFiltersProps {
  onClick?: () => void;
  className?: string;
  position?: 'left' | 'right';
}

export function ButtonFilters({ onClick, className, position = 'left' }: ButtonFiltersProps) {
  const isLeft = position === 'left';
  const positionClasses = isLeft ? 'left-0' : 'right-0';
  const roundedClasses = isLeft ? 'rounded-l-none rounded-r-full' : 'rounded-r-none rounded-l-full';
  const Icon = isLeft ? Libs.SlidersHorizontal : Libs.Users;

  return (
    <div className={Libs.cn('z-10 fixed top-[150px]', positionClasses)}>
      <Atoms.Button
        variant="secondary"
        size="icon"
        onClick={onClick}
        className={Libs.cn(
          'hidden lg:inline-flex px-4 py-3 bg-secondary shadow-xl hover:bg-secondary/90',
          roundedClasses,
          className,
        )}
      >
        <Icon className="h-6 w-6" />
      </Atoms.Button>
    </div>
  );
}
