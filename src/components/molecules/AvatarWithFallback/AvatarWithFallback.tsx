'use client';

import { useState, useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface AvatarWithFallbackProps {
  avatarUrl?: string;
  name: string;
  size?: Atoms.AvatarSize;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
}

export function AvatarWithFallback({
  avatarUrl,
  name,
  size = 'default',
  className,
  fallbackClassName,
  alt,
}: AvatarWithFallbackProps): React.ReactElement {
  const [imageError, setImageError] = useState(false);

  // Reset error state when avatarUrl changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  return (
    <Atoms.Avatar size={size} className={className}>
      {avatarUrl && !imageError ? (
        <Atoms.AvatarImage src={avatarUrl} alt={alt || name} onError={() => setImageError(true)} />
      ) : (
        <Atoms.AvatarFallback className={fallbackClassName}>{Libs.extractInitials({ name })}</Atoms.AvatarFallback>
      )}
    </Atoms.Avatar>
  );
}
