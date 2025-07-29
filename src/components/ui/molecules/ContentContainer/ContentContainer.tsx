import { ReactNode } from 'react';
import { cn } from '@/libs';

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
    <div className={cn('flex flex-col mx-auto', maxWidthClasses[maxWidth], gapClasses[gap], className)}>{children}</div>
  );
}
