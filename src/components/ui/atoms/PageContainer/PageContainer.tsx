import { ReactNode } from 'react';
import { cn } from '@/libs';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'section';
  size?: 'default' | 'narrow' | 'wide';
}

export function PageContainer({ children, className, as: Component = 'div', size = 'default' }: PageContainerProps) {
  const sizeClasses = {
    default: 'container mx-auto px-6 lg:px-10 lg:pt-8',
    narrow: 'container mx-auto px-6 lg:px-10 lg:pt-8 max-w-[588px]',
    wide: 'container mx-auto px-6 lg:px-10 lg:pt-8 max-w-[1200px]',
  };

  return <Component className={cn(sizeClasses[size], className)}>{children}</Component>;
}
