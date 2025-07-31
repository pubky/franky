import { cn } from '@/libs';
import { Heading } from '@/components/ui';

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: React.HTMLAttributes<HTMLHeadingElement>['className'];
  size?: 'medium' | 'large';
}

export function PageTitle({ children, className, size = 'large', ...props }: PageTitleProps) {
  const sizeClasses = {
    medium: 'text-4xl lg:text-[60px]',
    large: 'text-5xl lg:text-7xl',
  };

  return (
    <Heading {...props} level={1} size="lg" className={cn(sizeClasses[size], className)}>
      {children}
    </Heading>
  );
}
