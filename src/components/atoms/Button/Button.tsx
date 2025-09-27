'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/libs';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive font-semibold cursor-pointer rounded-full border shadow-xs',
  {
    variants: {
      variant: {
        default: 'bg-brand/20 text-brand hover:!bg-brand/30 border-brand',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        brand: 'bg-brand text-background border-brand hover:bg-brand/90',
        link: 'text-primary underline-offset-4 hover:underline',
        dark: 'bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900',
        'dark-outline':
          'bg-transparent hover:bg-neutral-900 hover:text-white dark:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800',
      },
      size: {
        default: 'h-10 gap-1 px-4 py-2 has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 gap-1 px-8 py-7 has-[>svg]:px-6 md:has-[>svg]:px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef<
  React.ComponentRef<'button'>,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
