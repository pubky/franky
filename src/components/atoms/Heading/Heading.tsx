import { ReactNode } from 'react';
import { cn } from '@/libs';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: React.HTMLAttributes<HTMLElement>['className'];
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'semibold' | 'bold';
}

export function Heading({ level = 1, children, className, size = 'md', weight }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
    '2xl': 'text-7xl sm:text-9xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const lineHeightClasses = {
    sm: 'leading-normal',
    md: 'leading-normal',
    lg: 'leading-8',
    xl: 'leading-normal',
    '2xl': 'leading-normal',
  };

  const defaultWeight =
    size === 'lg' && level === 5 ? 'light' : size === '2xl' || size === 'xl' || size === 'lg' ? 'bold' : 'semibold';

  return (
    <Tag
      data-testid={`heading-${level}`}
      className={cn(
        sizeClasses[size],
        weightClasses[weight || defaultWeight],
        lineHeightClasses[size],
        'text-foreground',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
