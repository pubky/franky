import { ReactNode } from 'react';
import { cn } from '@/libs';

interface PageSubtitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h5' | 'p';
}

export function PageSubtitle({ children, className, as: Component = 'h2' }: PageSubtitleProps) {
  return (
    <Component className={cn('text-xl lg:text-2xl text-muted-foreground font-light leading-normal', className)}>
      {children}
    </Component>
  );
}
