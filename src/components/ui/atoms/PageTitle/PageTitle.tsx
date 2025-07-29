import { ReactNode } from 'react';
import { cn } from '@/libs';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
  size?: 'medium' | 'large';
}

export function PageTitle({ children, className, size = 'large' }: PageTitleProps) {
  const sizeClasses = {
    medium: 'text-4xl lg:text-[60px]',
    large: 'text-5xl lg:text-7xl',
  };

  return <h1 className={cn('font-bold leading-tight', sizeClasses[size], className)}>{children}</h1>;
}
