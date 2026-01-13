'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';
import { extractUserIdFromAvatarUrl } from './AvatarWithFallback.utils';

export interface AvatarWithFallbackProps {
  avatarUrl?: string;
  name: string;
  size?: Atoms.AvatarSize;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
  'data-testid'?: string;
}

export function AvatarWithFallback({
  avatarUrl,
  name,
  size = 'default',
  className,
  fallbackClassName,
  alt,
  'data-testid': dataTestId,
}: AvatarWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  const userId = useMemo(() => extractUserIdFromAvatarUrl(avatarUrl), [avatarUrl]);

  const moderationStatus = useLiveQuery(async () => {
    if (!userId) return null;
    return await Core.ModerationController.getModerationStatus(userId, Core.ModerationType.PROFILE);
  }, [userId]);

  // Show image immediately, apply blur only when status confirms
  const shouldBlur = moderationStatus?.is_blurred ?? false;

  // Reset error state when avatarUrl changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  return (
    <Atoms.Avatar size={size} className={className} data-testid={dataTestId}>
      {avatarUrl && !imageError ? (
        <>
          <Atoms.AvatarImage
            src={avatarUrl}
            alt={alt || name}
            onError={() => setImageError(true)}
            className={Libs.cn(shouldBlur && 'blur-xs')}
          />

          {shouldBlur && (
            <Atoms.Button
              overrideDefaults
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!userId) return;
                Core.ModerationController.unBlur(userId);
              }}
              className="absolute inset-0 flex cursor-pointer items-center justify-center"
            >
              <Libs.EyeOff className="size-1/2 max-h-10 max-w-10" />
            </Atoms.Button>
          )}
        </>
      ) : (
        <Atoms.AvatarFallback className={fallbackClassName}>{Libs.extractInitials({ name })}</Atoms.AvatarFallback>
      )}
    </Atoms.Avatar>
  );
}
