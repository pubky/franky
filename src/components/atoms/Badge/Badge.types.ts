import * as React from 'react';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends React.ComponentProps<'span'> {
  className?: React.HTMLAttributes<HTMLSpanElement>['className'];
  variant?: BadgeVariant;
  asChild?: boolean;
}
