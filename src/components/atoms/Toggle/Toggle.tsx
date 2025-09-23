'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';

import { cn } from '@/libs';

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-lg cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-transparent text-white hover:bg-muted hover:text-muted-foreground active:bg-accent',
        outline:
          'bg-background border border-input shadow-xs hover:bg-muted hover:text-accent-foreground active:bg-accent',
      },
      size: {
        default: 'h-9 px-3 py-2.5',
        sm: 'h-8 p-2.5',
        lg: 'h-10 px-3.5 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  /**
   * Custom icon to display. If not provided, a default check icon will be used.
   */
  icon?: React.ReactNode;
  /**
   * Text to display next to the icon
   */
  children?: React.ReactNode;
  /**
   * Whether to show the text content
   */
  showText?: boolean;
  /**
   * Whether to show the icon
   */
  showIcon?: boolean;
  /**
   * Whether the toggle is pressed/active
   */
  pressed?: boolean;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    { className, variant, size, icon, children = 'Text', showText = true, showIcon = true, pressed = false, ...props },
    ref,
  ) => {
    const getTestId = () => {
      const effectiveVariant = variant || 'default';
      return `toggle-${effectiveVariant}`;
    };

    return (
      <button
        ref={ref}
        data-slot="toggle"
        data-testid={getTestId()}
        data-variant={variant}
        data-size={size}
        data-pressed={pressed}
        aria-pressed={pressed}
        {...props}
        className={cn(
          toggleVariants({ variant, size }),
          pressed && variant === 'default' && 'bg-accent text-white',
          pressed && variant === 'outline' && 'bg-accent text-white border-accent',
          className,
        )}
      >
        {showIcon && (icon || <Check className="size-4" />)}
        {showText && children && <span className="text-sm font-medium leading-5">{children}</span>}
      </button>
    );
  },
);

Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };
