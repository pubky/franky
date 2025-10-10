'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ProfileAvatarProps {
  src?: string;
  alt?: string;
  size?: Atoms.AvatarSize;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export function ProfileAvatar({
  src,
  alt = 'User avatar',
  size = 'xl',
  onClick,
  className,
  'data-testid': dataTestId,
}: ProfileAvatarProps) {
  return (
    <Atoms.Avatar
      size={size}
      className={Libs.cn(onClick && 'cursor-pointer hover:opacity-80 transition-opacity', className)}
      onClick={onClick}
      data-testid={dataTestId || 'profile-avatar'}
    >
      <Atoms.AvatarImage src={src} alt={alt} />
      <Atoms.AvatarFallback>{Libs.extractInitials({ name: alt, maxLength: 2 })}</Atoms.AvatarFallback>
    </Atoms.Avatar>
  );
}
