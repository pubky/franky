import { ReactNode } from 'react';
import { cn } from '@/libs';

interface PageSubtitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  as?: 'h2' | 'h5' | 'p';
  title?: string;
}

export function PageSubtitle({
  as: Component = 'h2',
  className,
  children,
  title,
  ...props
}: PageSubtitleProps): React.ReactElement {
  return (
    <Component
      className={cn('text-xl leading-normal font-light text-muted-foreground lg:text-2xl', className)}
      {...props}
    >
      {title || children}
    </Component>
  );
}
