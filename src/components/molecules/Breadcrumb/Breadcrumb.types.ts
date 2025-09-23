import * as React from 'react';

export interface BreadcrumbProps extends React.ComponentProps<'nav'> {
  className?: React.HTMLAttributes<HTMLElement>['className'];
}

export interface BreadcrumbListProps extends React.ComponentProps<'ol'> {
  className?: React.HTMLAttributes<HTMLOListElement>['className'];
}

export interface BreadcrumbItemProps extends React.ComponentProps<'li'> {
  className?: React.HTMLAttributes<HTMLLIElement>['className'];
}

export interface BreadcrumbLinkProps extends React.ComponentProps<'a'> {
  className?: React.HTMLAttributes<HTMLAnchorElement>['className'];
  asChild?: boolean;
}

export interface BreadcrumbPageProps extends React.ComponentProps<'span'> {
  className?: React.HTMLAttributes<HTMLSpanElement>['className'];
}

export interface BreadcrumbSeparatorProps extends React.ComponentProps<'li'> {
  className?: React.HTMLAttributes<HTMLLIElement>['className'];
  children?: React.ReactNode;
}
