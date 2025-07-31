import { cn } from '@/libs';
import { cva } from 'class-variance-authority';
import NextLink from 'next/link';
import { ComponentProps } from 'react';

interface LinkProps extends ComponentProps<typeof NextLink> {
  variant?: 'default' | 'muted';
  size?: 'default' | 'lg' | 'xl';
}

export function Link({ variant = 'default', size = 'default', ...props }: LinkProps) {
  const linkVariants = cva('cursor-pointer text-brand hover:text-brand/80 transition-colors', {
    variants: {
      variant: {
        default: 'text-brand',
        muted: 'text-muted-foreground hover:text-brand',
      },
      size: {
        default: 'text-sm',
        lg: 'text-lg',
        xl: 'text-xl',
      },
    },
  });

  const linkClassName = cn(linkVariants({ variant, size }), props.className);

  return (
    <NextLink className={linkClassName} {...props}>
      {props.children}
    </NextLink>
  );
}
