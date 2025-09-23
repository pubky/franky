import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import * as Libs from '@/libs';
import { ChevronRight } from 'lucide-react';
import type {
  BreadcrumbProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
} from './Breadcrumb.types';

export function Breadcrumb({ ...props }: BreadcrumbProps) {
  const { className, ...restProps } = props;

  return (
    <nav
      data-slot="breadcrumb"
      data-testid="breadcrumb"
      aria-label="breadcrumb"
      className={Libs.cn('', className)}
      {...restProps}
    />
  );
}

export function BreadcrumbList({ ...props }: BreadcrumbListProps) {
  const { className, ...restProps } = props;

  return (
    <ol
      data-slot="breadcrumb-list"
      data-testid="breadcrumb-list"
      className={Libs.cn(
        'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
        className,
      )}
      {...restProps}
    />
  );
}

export function BreadcrumbItem({ ...props }: BreadcrumbItemProps) {
  const { className, ...restProps } = props;

  return (
    <li
      data-slot="breadcrumb-item"
      data-testid="breadcrumb-item"
      className={Libs.cn('inline-flex items-center gap-1.5', className)}
      {...restProps}
    />
  );
}

export function BreadcrumbLink({ ...props }: BreadcrumbLinkProps) {
  const { className, asChild = false, ...restProps } = props;

  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      data-testid="breadcrumb-link"
      className={Libs.cn('transition-colors hover:text-foreground', className)}
      {...restProps}
    />
  );
}

export function BreadcrumbPage({ ...props }: BreadcrumbPageProps) {
  const { className, ...restProps } = props;

  return (
    <span
      data-slot="breadcrumb-page"
      data-testid="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={Libs.cn('font-normal text-foreground', className)}
      {...restProps}
    />
  );
}

export function BreadcrumbSeparator({ children, ...props }: BreadcrumbSeparatorProps) {
  const { className, ...restProps } = props;

  return (
    <li
      data-slot="breadcrumb-separator"
      data-testid="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={Libs.cn('[&>svg]:size-3.5', className)}
      {...restProps}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}
