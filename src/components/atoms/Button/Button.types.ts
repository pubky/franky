import * as React from 'react';

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'brand'
  | 'link'
  | 'dark'
  | 'dark-outline';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: React.HTMLAttributes<HTMLButtonElement>['className'];
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}
