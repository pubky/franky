'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface UserData {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  tagsCount?: number;
  postsCount?: number;
}

interface UserProps {
  user: UserData;
  onAction?: (userId: string) => void;
  actionIcon?: React.ReactNode;
  showAction?: boolean;
  actionVariant?: Atoms.ButtonVariant;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  'data-testid'?: string;
}

export function User({
  user,
  onAction,
  actionIcon = <Libs.UserRoundPlus className="w-4 h-4" />,
  showAction = true,
  actionVariant = Atoms.ButtonVariant.SECONDARY,
  className,
  'data-testid': dataTestId,
}: UserProps) {
  return (
    <Atoms.Container
      className={Libs.cn('flex flex-row gap-2 items-center', className)}
      data-testid={dataTestId || 'user'}
    >
      <Atoms.Avatar className="size-8" data-testid="user-avatar">
        <Atoms.AvatarImage src={user.avatar} alt={user.name} />
        <Atoms.AvatarFallback>{Libs.extractInitials({ name: user.name, maxLength: 2 })}</Atoms.AvatarFallback>
      </Atoms.Avatar>

      <Atoms.Container className="flex flex-1 flex-col min-w-0">
        <Atoms.Typography size="sm" className="font-bold truncate" data-testid="user-name">
          {user.name}
        </Atoms.Typography>
        {user.tagsCount && user.postsCount ? (
          <Atoms.Container className="flex flex-row gap-2">
            <Atoms.Typography
              className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-medium truncate"
              data-testid="user-tags-count"
            >
              <Libs.Tag className="w-2 h-2" />
              {user.tagsCount}
            </Atoms.Typography>
            <Atoms.Typography
              className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-medium truncate"
              data-testid="user-posts-count"
            >
              <Libs.StickyNote className="w-2 h-2" />
              {user.postsCount}
            </Atoms.Typography>
          </Atoms.Container>
        ) : (
          <Atoms.Typography className="text-xs text-muted-foreground font-medium truncate" data-testid="user-handle">
            {user.handle}
          </Atoms.Typography>
        )}
      </Atoms.Container>

      {showAction && (
        <Atoms.Button
          onClick={() => onAction?.(user.id)}
          variant={actionVariant}
          size="sm"
          className="w-8 h-8"
          data-testid={`user-action-${user.id}`}
        >
          {actionIcon}
        </Atoms.Button>
      )}
    </Atoms.Container>
  );
}
