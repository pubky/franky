import { ReactNode } from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'sm' | 'md' | 'lg';
}

export function ContentContainer({ children, className, maxWidth = 'lg', gap = 'md' }: ContentContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-[588px]',
    md: 'max-w-[800px]',
    lg: 'max-w-[1200px]',
    xl: 'max-w-[1400px]',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <Atoms.Container className={Libs.cn(maxWidthClasses[maxWidth], gapClasses[gap], className)}>
      {children}
    </Atoms.Container>
  );
}
