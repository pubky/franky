'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

function FilterRoot({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <Atoms.Container
      data-slot="filter-root"
      data-testid="filter-root"
      className={Libs.cn('flex flex-col gap-2 bg-background', className)}
      {...props}
    >
      {children}
    </Atoms.Container>
  );
}

function FilterHeader({
  title,
  subtitle,
  className,
  ...props
}: {
  title: string;
  subtitle?: string;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <div data-slot="filter-header" data-testid="filter-header" className="flex flex-col gap-2" {...props}>
      <Atoms.Heading level={2} size="lg" className={Libs.cn('text-muted-foreground font-light', className)}>
        {title}
      </Atoms.Heading>
      {subtitle && (
        <p className="text-base font-medium leading-normal text-[var(--base-secondary-foreground,#D4D4DB)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FilterList({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <Atoms.Container
      data-slot="filter-list"
      data-testid="filter-list"
      className={Libs.cn('flex flex-col gap-2', className)}
      {...props}
    >
      {children}
    </Atoms.Container>
  );
}

function FilterItem({
  isSelected = false,
  onClick,
  className,
  children,
  ...props
}: {
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Atoms.Typography
      data-slot="filter-item"
      data-testid="filter-item"
      data-selected={isSelected ? 'true' : 'false'}
      className={Libs.cn(
        'cursor-pointer flex gap-2 items-center text-base font-medium transition-colors',
        isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80',
        className,
      )}
      size="sm"
      onClick={onClick}
      {...props}
    >
      {children}
    </Atoms.Typography>
  );
}

function FilterItemIcon({
  icon: Icon,
  className,
  ...props
}: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onCopy' | 'onCut' | 'onPaste'>) {
  return <Icon className={Libs.cn('w-5 h-5', className)} {...props} />;
}

function FilterItemLabel({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={Libs.cn('', className)} {...props}>
      {children}
    </span>
  );
}

export { FilterRoot, FilterHeader, FilterList, FilterItem, FilterItemIcon, FilterItemLabel };
