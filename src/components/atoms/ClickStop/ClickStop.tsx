import React, { ReactNode } from 'react';
import * as Atoms from '@/atoms';

export interface ClickStopProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function ClickStop({ children, className, 'data-testid': dataTestId }: ClickStopProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <Atoms.Container
      onClick={handleClick}
      className={className}
      overrideDefaults
      data-testid={dataTestId || 'click-stop'}
    >
      {children}
    </Atoms.Container>
  );
}
