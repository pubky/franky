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
  size?: 'sm' | 'md' | 'lg' | 'xl';
  overrideDefaults?: boolean;
  'data-testid'?: string;
}

export function Typography({
  as: Tag = 'p',
  children,
  className,
  size = 'md',
  overrideDefaults = false,
  'data-testid': dataTestId,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-4xl font-bold',
  };

  const typographyClassName = overrideDefaults ? className : cn(sizeClasses[size], 'text-foreground', className);

  return (
    <Tag data-testid={dataTestId || 'typography'} {...props} className={typographyClassName}>
      {children}
    </Tag>
  );
}
