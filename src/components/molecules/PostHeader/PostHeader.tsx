import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface PostHeaderProps {
  avatarSrc?: string;
  avatarAlt?: string;
  displayName: string;
  label?: string;
  timeLabel?: string;
  className?: string;
}

export function PostHeader({
  avatarSrc,
  avatarAlt = 'avatar',
  displayName,
  label,
  timeLabel,
  className,
}: PostHeaderProps) {
  return (
    <div className={Libs.cn('flex items-start justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        <Atoms.Avatar size="lg">
          <Atoms.AvatarImage src={avatarSrc} alt={avatarAlt} />
          <Atoms.AvatarFallback>{Libs.extractInitials({ name: displayName, maxLength: 2 })}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        <div className="flex flex-col">
          <span className="text-base leading-6 font-bold text-foreground">{displayName}</span>
          {label && (
            <span className="text-xs leading-4 font-medium tracking-[0.075em] uppercase text-muted-foreground">
              {label}
            </span>
          )}
        </div>
      </div>
      {timeLabel && (
        <div className="flex items-center gap-1 text-xs font-medium tracking-[0.075em] text-muted-foreground">
          <Libs.Clock className="size-4 text-muted-foreground" />
          <span>{timeLabel}</span>
        </div>
      )}
    </div>
  );
}
