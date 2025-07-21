import { ReactNode } from 'react';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}

export function Heading({ level = 1, children, className, size = 'md' }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-4xl font-bold',
    hero: 'text-6xl lg:text-[128px] font-bold leading-none lg:leading-[128px]',
  };

  const combinedClassName = `${sizeClasses[size]} text-foreground ${className || ''}`.trim();

  return <Tag className={combinedClassName}>{children}</Tag>;
}
