import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  className = '',
  titleClassName = 'text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground',
  subtitleClassName = 'text-lg sm:text-xl lg:text-2xl text-muted-foreground',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className={titleClassName}>{title}</h1>
        {action && action}
      </div>
      {subtitle && <div className={subtitleClassName}>{subtitle}</div>}
    </div>
  );
}
