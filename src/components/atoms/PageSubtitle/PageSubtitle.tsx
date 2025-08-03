import { ReactNode } from 'react';
import { cn } from '@/libs';

interface PageSubtitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  as?: 'h2' | 'h5' | 'p';
  title?: string;
}

export function PageSubtitle({ as: Component = 'h2', className, children, title, ...props }: PageSubtitleProps) {
  return (
    <Component
      className={cn('text-xl lg:text-2xl text-muted-foreground font-light leading-normal', className)}
      {...props}
    >
      {title || children}
    </Component>
  );
}
