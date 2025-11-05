import { ReactNode } from 'react';
import { cn } from '@/libs';

export interface ClickStopProps {
  children?: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  'data-testid'?: string;
}

export function ClickStop({
  children,
  className,
  as: Tag = 'div',
  'data-testid': dataTestId,
  onClick,
  ...props
}: ClickStopProps & React.HTMLAttributes<HTMLElement>) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <Tag {...props} onClick={handleClick} className={cn(className)} data-testid={dataTestId || 'click-stop'}>
      {children}
    </Tag>
  );
}
