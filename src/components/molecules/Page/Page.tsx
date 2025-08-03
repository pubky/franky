import { ReactNode } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface PageContainerProps {
  children: ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  as?: 'div' | 'main' | 'section';
  size?: 'default' | 'narrow' | 'wide';
}

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: React.HTMLAttributes<HTMLHeadingElement>['className'];
  size?: 'medium' | 'large';
}

export function PageContainer({ as: Component = 'div', size = 'default', ...props }: PageContainerProps) {
  const sizeClasses = {
    default: 'container mx-auto px-6 lg:px-10 lg:pt-8',
    narrow: 'container mx-auto px-6 lg:px-10 lg:pt-8 max-w-[588px]',
    wide: 'container mx-auto px-6 lg:px-10 lg:pt-8 max-w-[1200px]',
  };

  return (
    <Component data-testid="page-container" className={Libs.cn(sizeClasses[size], props.className)}>
      {props.children}
    </Component>
  );
}

export function PageTitle({ children, className, size = 'large', ...props }: PageTitleProps) {
  const sizeClasses = {
    medium: 'text-4xl lg:text-[60px]',
    large: 'text-5xl lg:text-7xl',
  };

  return (
    <Atoms.Heading {...props} level={1} size="lg" className={Libs.cn(sizeClasses[size], className)}>
      {children}
    </Atoms.Heading>
  );
}
