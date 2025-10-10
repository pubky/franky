'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { ProfileAvatar } from '@/molecules/ProfileAvatar';

export interface ProfileHeaderProps {
  name: string;
  handle: string;
  bio?: string;
  avatar?: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  isLoadingFollow?: boolean;
  onFollowClick?: () => void;
  onEditClick?: () => void;
  onLogoutClick?: () => void;
  onCopyPubkey?: () => void;
  onCopyLink?: () => void;
  onMenuClick?: () => void;
  onAvatarClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export function ProfileHeader({
  name,
  handle,
  bio,
  avatar,
  isOwnProfile = false,
  isFollowing = false,
  isLoadingFollow = false,
  onFollowClick,
  onEditClick,
  onLogoutClick,
  onCopyPubkey,
  onCopyLink,
  onMenuClick,
  onAvatarClick,
  className,
  'data-testid': dataTestId,
}: ProfileHeaderProps) {
  return (
    <div className={Libs.cn('flex flex-col gap-6', className)} data-testid={dataTestId || 'profile-header'}>
      {/* Avatar and Info Section */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 bg-background/50 rounded-2xl p-6">
        <ProfileAvatar
          src={avatar}
          alt={name}
          size="xl"
          onClick={onAvatarClick}
          className="lg:w-[136px] lg:h-[136px]"
        />

        <div className="flex-1 flex flex-col gap-4 text-center lg:text-left w-full">
          {/* Name and Handle */}
          <div className="flex flex-col gap-2">
            <Atoms.Heading level={1} size="xl" className="text-2xl">
              {name}
            </Atoms.Heading>
            {bio && (
              <Atoms.Typography size="md" className="text-muted-foreground">
                {bio}
              </Atoms.Typography>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {/* Own Profile Actions */}
            {isOwnProfile && (
              <>
                <Atoms.Button variant="secondary" size="default" onClick={onEditClick} data-testid="profile-edit-btn">
                  <Libs.Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Atoms.Button>
                <Atoms.Button
                  variant="secondary"
                  size="default"
                  onClick={onLogoutClick}
                  data-testid="profile-logout-btn"
                >
                  <Libs.LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Atoms.Button>
              </>
            )}

            {/* Other User Profile Actions */}
            {!isOwnProfile && onFollowClick && (
              <Atoms.Button
                variant={isFollowing ? 'secondary' : 'default'}
                size="default"
                onClick={onFollowClick}
                disabled={isLoadingFollow}
                data-testid="profile-follow-btn"
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

            {/* Copy Pubkey Button */}
            {onCopyPubkey && (
              <Atoms.Button
                variant="secondary"
                size="default"
                onClick={onCopyPubkey}
                data-testid="profile-copy-pubkey-btn"
              >
                <Libs.Key className="mr-2 h-4 w-4" />
                {handle}
              </Atoms.Button>
            )}

            {/* Copy Link Button */}
            {onCopyLink && (
              <Atoms.Button variant="secondary" size="default" onClick={onCopyLink} data-testid="profile-copy-link-btn">
                <Libs.Link className="mr-2 h-4 w-4" />
                Link
              </Atoms.Button>
            )}

            {/* Menu Button (for other users) */}
            {!isOwnProfile && onMenuClick && (
              <Atoms.Button
                variant="ghost"
                size="default"
                onClick={onMenuClick}
                data-testid="profile-menu-btn"
                className="w-10"
              >
                <Libs.MoreVertical className="h-4 w-4" />
              </Atoms.Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
