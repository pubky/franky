import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { type VariantProps } from 'class-variance-authority';

export type AvatarSize = 'sm' | 'default' | 'lg' | 'xl';

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof import('./Avatar').avatarVariants> {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
}

export interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  className?: React.HTMLAttributes<HTMLImageElement>['className'];
}

export interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
}
