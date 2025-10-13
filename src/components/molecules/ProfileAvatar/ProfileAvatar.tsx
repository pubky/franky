'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ProfileAvatarProps {
  name: string;
  handle: string;
  avatar?: string;
  coverImage?: string;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onFollowToggle?: () => void;
  isFollowing?: boolean;
  className?: string;
}

export function ProfileAvatar({
  name,
  handle,
  avatar,
  coverImage,
  isOwnProfile = false,
  onEditProfile,
  onFollowToggle,
  isFollowing = false,
  className,
}: ProfileAvatarProps) {
  return (
    <Atoms.Card className={Libs.cn('relative overflow-hidden', className)}>
      {/* Cover Image */}
      {coverImage && (
        <div className="h-32 w-full bg-muted">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}
      {!coverImage && <div className="h-32 w-full bg-gradient-to-r from-primary/20 to-secondary/20" />}

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          {/* Avatar */}
          <Atoms.Avatar className="size-24 border-4 border-background">
            <Atoms.AvatarImage src={avatar} alt={name} />
            <Atoms.AvatarFallback>{Libs.extractInitials({ name, maxLength: 2 })}</Atoms.AvatarFallback>
          </Atoms.Avatar>

          {/* Action Button */}
          {isOwnProfile ? (
            <Atoms.Button variant="secondary" size="sm" onClick={onEditProfile} className="mt-4">
              <Libs.Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Atoms.Button>
          ) : (
            <Atoms.Button
              variant={isFollowing ? 'outline' : 'default'}
              size="sm"
              onClick={onFollowToggle}
              className="mt-4"
            >
              {isFollowing ? (
                <>
                  <Libs.UserMinus className="w-4 h-4 mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <Libs.UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Atoms.Button>
          )}
        </div>

        {/* Name and Handle */}
        <div className="space-y-1">
          <Atoms.Heading level={1} size="xl">
            {name}
          </Atoms.Heading>
          <Atoms.Typography size="sm" className="text-muted-foreground">
            {handle}
          </Atoms.Typography>
        </div>
      </div>
    </Atoms.Card>
  );
}

