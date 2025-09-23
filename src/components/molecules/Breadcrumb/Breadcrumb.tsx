'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as Libs from '@/libs';

const breadcrumbVariants = cva('flex items-center flex-wrap', {
  variants: {
    size: {
      sm: 'gap-1.5',
      md: 'gap-2.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const breadcrumbItemVariants = cva('flex items-center justify-center gap-2.5', {
  variants: {
    variant: {
      link: 'text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
      current: 'text-foreground',
      ellipsis: 'text-muted-foreground',
      dropdown: 'text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded overflow-hidden',
    },
  },
  defaultVariants: {
    variant: 'link',
  },
});

const breadcrumbSeparatorVariants = cva('text-muted-foreground shrink-0', {
  variants: {
    size: {
      sm: 'w-[15px] h-[15px]',
      md: 'w-[15px] h-[15px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof breadcrumbVariants> {
  children: React.ReactNode;
}

export interface BreadcrumbItemProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof breadcrumbItemVariants> {
  children: React.ReactNode;
  href?: string;
  dropdown?: boolean;
}

export interface BreadcrumbSeparatorProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof breadcrumbSeparatorVariants> {
  icon?: React.ReactNode;
}

export type BreadcrumbEllipsisProps = React.HTMLAttributes<HTMLLIElement>;

// Main Breadcrumb container
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, size, children, ...props }, ref) => (
    <nav ref={ref} aria-label="breadcrumb" className={Libs.cn(breadcrumbVariants({ size }), className)} {...props}>
      <ol className="flex items-center flex-wrap gap-inherit">{children}</ol>
    </nav>
  ),
);
Breadcrumb.displayName = 'Breadcrumb';

// Breadcrumb Item
export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, variant, children, href, dropdown, onClick, ...props }, ref) => {
    const itemVariant = variant || (dropdown ? 'dropdown' : 'link');

    const content = (
      <>
        <span className="font-bold text-sm leading-5 font-sans">{children}</span>
        {dropdown && <Libs.ChevronDown className="w-[15px] h-[15px]" />}
      </>
    );

    return (
      <li
        ref={ref}
        className={Libs.cn(breadcrumbItemVariants({ variant: itemVariant }), className)}
        onClick={onClick}
        {...props}
      >
        {href && !dropdown ? (
          <a href={href} className="flex items-center gap-1">
            {content}
          </a>
        ) : (
          <button type="button" className="flex items-center gap-1">
            {content}
          </button>
        )}
      </li>
    );
  },
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

// Breadcrumb Separator
export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, icon, size, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={Libs.cn(breadcrumbSeparatorVariants({ size }), className)}
      {...props}
    >
      {icon || <Libs.ChevronRight className="w-full h-full" />}
    </li>
  ),
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// Breadcrumb Ellipsis
export const BreadcrumbEllipsis = React.forwardRef<HTMLLIElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      className={Libs.cn('flex items-center justify-center w-9 h-9', className)}
      {...props}
    >
      <Libs.MoreHorizontal className="w-4 h-4 text-muted-foreground" />
    </li>
  ),
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// Convenience component for current page
export const BreadcrumbPage = React.forwardRef<HTMLLIElement, Omit<BreadcrumbItemProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <BreadcrumbItem ref={ref} variant="current" aria-current="page" className={className} {...props} />
  ),
);
BreadcrumbPage.displayName = 'BreadcrumbPage';
