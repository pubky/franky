import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

export type AvatarSize = 'sm' | 'default' | 'lg' | 'xl';

export interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  size?: AvatarSize;
}

export interface AvatarImageProps extends React.ComponentProps<typeof AvatarPrimitive.Image> {
  className?: React.HTMLAttributes<HTMLImageElement>['className'];
}

export interface AvatarFallbackProps extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
}
