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
  // User info (only for other users' profiles when scrolling)
  showUserCard?: boolean;
  name?: string;
  handle?: string;
  bio?: string;
  avatar?: string;
  isFollowing?: boolean;
  onFollowClick?: () => void;
  isLoadingFollow?: boolean;

  // Tags
  tags?: ProfileInfoTag[];
  onAddTag?: () => void;
  isLoadingTags?: boolean;

  // Links
  links?: ProfileInfoLink[];

  className?: string;
}

export function ProfileInfo({
  showUserCard = false,
  name,
  handle,
  bio,
  avatar,
  isFollowing,
  onFollowClick,
  isLoadingFollow,
  tags = [],
  onAddTag,
  isLoadingTags = false,
  links = [],
  className,
}: ProfileInfoProps) {
  return (
    <div className={Libs.cn('flex flex-col gap-6', className)}>
      {/* User Card - shown on scroll or for other profiles */}
      {showUserCard && name && handle && (
        <Molecules.ProfileSidebarUser
          name={name}
          handle={handle}
          bio={bio}
          avatar={avatar}
          showFollowButton={onFollowClick !== undefined}
          isFollowing={isFollowing}
          onFollowClick={onFollowClick}
          isLoadingFollow={isLoadingFollow}
        />
      )}

      {/* Tags Section */}
      {(tags.length > 0 || onAddTag) && (
        <Molecules.ProfileSidebarTags tags={tags} onAddTag={onAddTag} isLoading={isLoadingTags} />
      )}

      {/* Links Section */}
      {links.length > 0 && <Molecules.ProfileSidebarLinks links={links} />}

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
