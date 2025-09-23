import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import * as Libs from '@/libs';
import type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from './Avatar.types';

const defaultProps = {
  size: 'default' as const,
};

export function Avatar({ ...props }: AvatarProps) {
  const { className, size, ...restProps } = { ...defaultProps, ...props };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'size-6';
      case 'default':
        return 'size-8';
      case 'lg':
        return 'size-12';
      case 'xl':
        return 'size-16';
      default:
        return 'size-8';
    }
  };

  const getTestId = () => {
    return `avatar-${size}`;
  };

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-testid={getTestId()}
      data-size={size}
      className={Libs.cn('relative flex shrink-0 overflow-hidden rounded-full', getSizeStyles(), className)}
      {...restProps}
    />
  );
}

export function AvatarImage({ ...props }: AvatarImageProps) {
  const { className, ...restProps } = props;

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      data-testid="avatar-image"
      className={Libs.cn('aspect-square size-full', className)}
      {...restProps}
    />
  );
}

export function AvatarFallback({ ...props }: AvatarFallbackProps) {
  const { className, ...restProps } = props;

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      data-testid="avatar-fallback"
      className={Libs.cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
      {...restProps}
    />
  );
}
