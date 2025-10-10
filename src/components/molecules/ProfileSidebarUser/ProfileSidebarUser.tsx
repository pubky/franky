'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { ProfileAvatar } from '../ProfileAvatar';

export interface ProfileSidebarUserProps {
  name: string;
  handle: string;
  bio?: string;
  avatar?: string;
  showFollowButton?: boolean;
  isFollowing?: boolean;
  onFollowClick?: () => void;
  onMenuClick?: () => void;
  isLoadingFollow?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function ProfileSidebarUser({
  name,
  handle,
  bio,
  avatar,
  showFollowButton = false,
  isFollowing = false,
  onFollowClick,
  onMenuClick,
  isLoadingFollow = false,
  className,
  'data-testid': dataTestId,
}: ProfileSidebarUserProps) {
  return (
    <Atoms.Card
      className={Libs.cn('p-4 flex flex-col gap-3', className)}
      data-testid={dataTestId || 'profile-sidebar-user'}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ProfileAvatar src={avatar} alt={name} size="default" />
          <div className="flex-1 min-w-0">
            <Atoms.Typography size="sm" className="font-bold truncate">
              {name}
            </Atoms.Typography>
            <Atoms.Typography size="sm" className="text-xs text-muted-foreground truncate">
              {handle}
            </Atoms.Typography>
          </div>
        </div>
        {onMenuClick && (
          <Atoms.Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 flex-shrink-0"
            onClick={onMenuClick}
            data-testid="profile-sidebar-user-menu"
          >
            <Libs.MoreVertical className="w-4 h-4" />
          </Atoms.Button>
        )}
      </div>

      {bio && (
        <Atoms.Typography size="sm" className="text-muted-foreground break-words">
          {bio}
        </Atoms.Typography>
      )}

      {showFollowButton && onFollowClick && (
        <Atoms.Button
          variant={isFollowing ? 'secondary' : 'default'}
          size="sm"
          onClick={onFollowClick}
          disabled={isLoadingFollow}
          className="w-full"
          data-testid="profile-sidebar-user-follow"
        >
          {isLoadingFollow ? (
            <>
              <Libs.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : isFollowing ? (
            <>
              <Libs.UserMinus className="mr-2 h-4 w-4" />
              Unfollow
            </>
          ) : (
            <>
              <Libs.UserPlus className="mr-2 h-4 w-4" />
              Follow
            </>
          )}
        </Atoms.Button>
      )}
    </Atoms.Card>
  );
}
