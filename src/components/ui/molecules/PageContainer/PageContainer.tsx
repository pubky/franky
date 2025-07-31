import { ReactNode } from 'react';
import { cn } from '@/libs';

interface PageContainerProps {
  children: ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  as?: 'div' | 'main' | 'section';
  size?: 'default' | 'narrow' | 'wide';
}

export function PageContainer({ as: Component = 'div', size = 'default', ...props }: PageContainerProps) {
  const sizeClasses = {
    default: 'container mx-auto px-6 lg:px-10 lg:pt-8',
    narrow: 'container mx-auto px-6 lg:px-10 lg:pt-8 max-w-[588px]',
    wide: 'container mx-auto px-6 lg:px-10 lg:pt-8 max-w-[1200px]',
  };

  return <Component className={cn(sizeClasses[size], props.className)}>{props.children}</Component>;
}
