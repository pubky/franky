import { ReactNode } from 'react';
import { cn } from '@/libs';

interface TypographyProps {
  as?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'p'
    | 'span'
    | 'i'
    | 'b'
    | 'strong'
    | 'em'
    | 'small'
    | 'sub'
    | 'sup'
    | 'code'
    | 'pre'
    | 'blockquote';
  children: ReactNode;
  className?: React.HTMLAttributes<HTMLElement>['className'];
  size?: 'sm' | 'base' | 'md' | 'lg' | 'xl';
  'data-testid'?: string;
}

export function Typography({
  as: Tag = 'p',
  children,
  className,
  size = 'md',
  'data-testid': dataTestId,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  const sizeClasses = {
    sm: 'text-sm font-semibold leading-5',
    base: 'text-base font-medium leading-6',
    md: 'text-xl font-semibold leading-normal',
    lg: 'text-2xl font-bold leading-normal',
    xl: 'text-4xl font-bold leading-normal',
  };

  return (
    <Tag
      data-testid={dataTestId || 'typography'}
      {...props}
      className={cn(sizeClasses[size], 'text-foreground', className)}
    >
      {children}
    </Tag>
  );
}
