import { ReactNode } from 'react';
import { PageTitle, PageSubtitle } from '@/components/ui';
import { cn } from '@/libs';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  titleSize?: 'medium' | 'large';
}

export function PageHeader({ title, subtitle, className, titleSize = 'large' }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <PageTitle size={titleSize}>{title}</PageTitle>
      {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
    </div>
  );
}
