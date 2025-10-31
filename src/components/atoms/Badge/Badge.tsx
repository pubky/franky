'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/libs';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-sm font-semibold leading-5 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 focus-visible:ring-destructive/40 bg-destructive/60',
        outline: 'text-foreground bg-background [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        brand: 'bg-brand text-background [a&]:hover:bg-brand/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Badge = React.forwardRef<
  React.ComponentRef<'div'>,
  React.ComponentProps<'div'> &
    VariantProps<typeof badgeVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      data-variant={variant}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
