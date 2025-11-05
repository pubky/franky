import React, { ReactNode } from 'react';
import { cn } from '@/libs';

export interface ClickStopProps {
  children?: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
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
    if (onClick) {
      onClick(e as React.MouseEvent<HTMLElement>);
    }
  };

  return (
    <Tag
      {...(props as Record<string, unknown>)}
      onClick={handleClick as unknown as React.MouseEventHandler<Element>}
      className={cn(className)}
      data-testid={dataTestId || 'click-stop'}
    >
      {children}
    </Tag>
  );
}
