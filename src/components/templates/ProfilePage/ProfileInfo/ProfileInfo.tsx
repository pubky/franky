'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

export interface ProfileInfoTag {
  label: string;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onSearchClick?: () => void;
}

export interface ProfileInfoLink {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ProfileInfoProps {
  // User info
  name?: string;
  handle?: string;
  bio?: string;
  avatar?: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowClick?: () => void;
  onEditClick?: () => void;
  onMenuClick?: () => void;
  isLoadingFollow?: boolean;

  // Tags
  tags?: ProfileInfoTag[];
  onAddTag?: () => void;
  isLoadingTags?: boolean;

  // Links
  links?: ProfileInfoLink[];

  showUserCard?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function ProfileInfo({
  name,
  handle,
  bio,
  avatar,
  isOwnProfile = false,
  isFollowing = false,
  onFollowClick,
  onEditClick,
  onMenuClick,
  isLoadingFollow = false,
  tags,
  onAddTag,
  isLoadingTags = false,
  links,
  showUserCard = true,
  className,
  'data-testid': dataTestId,
}: ProfileInfoProps) {
  return (
    <div className={Libs.cn('flex flex-col gap-6', className)} data-testid={dataTestId || 'profile-info'}>
      {showUserCard && name && handle && (
        <Molecules.ProfileSidebarUser
          name={name}
          handle={handle}
          bio={bio}
          avatar={avatar}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          isLoadingFollow={isLoadingFollow}
          onFollowClick={onFollowClick}
          onEditClick={onEditClick}
          onMenuClick={onMenuClick}
        />
      )}

      {tags && tags.length > 0 && (
        <Molecules.ProfileSidebarTags tags={tags} onAddTag={onAddTag} isLoading={isLoadingTags} />
      )}

      {links && links.length > 0 && <Molecules.ProfileSidebarLinks links={links} />}

      {/* Feedback/Help Card */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Help & Feedback" />
        <Atoms.FilterList>
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.MessageCircle} />
            <Atoms.FilterItemLabel>Send feedback</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.HelpCircle} />
            <Atoms.FilterItemLabel>Help center</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
        </Atoms.FilterList>
      </Atoms.FilterRoot>
    </div>
  );
}
