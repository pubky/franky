import React, { ReactNode } from 'react';
import { cn } from '@/libs';

export interface ClickStopProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function ClickStop({ children, className, 'data-testid': dataTestId }: ClickStopProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div onClick={handleClick} className={cn(className)} data-testid={dataTestId || 'click-stop'}>
      {children}
    </div>
  );
}
