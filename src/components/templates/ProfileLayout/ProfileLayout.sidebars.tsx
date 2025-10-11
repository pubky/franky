import * as React from 'react';
import { ProfileMenu, ProfileMenuTab } from '../ProfilePage/ProfileMenu';
import { ProfileInfo, ProfileInfoTag, ProfileInfoLink } from '../ProfilePage/ProfileInfo';

interface ProfileSidebarsProps {
  tabs: ProfileMenuTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;

  // User info
  name?: string;
  handle?: string;
  bio?: string;
  avatar?: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowClick?: () => void;
  onEditClick?: () => void;
  isLoadingFollow?: boolean;

  // Tags
  tags?: ProfileInfoTag[];
  onAddTag?: () => void;
  isLoadingTags?: boolean;

  // Links
  links?: ProfileInfoLink[];
}

export function ProfileLeftSidebar({
  tabs,
  activeTab,
  onTabChange,
}: Pick<ProfileSidebarsProps, 'tabs' | 'activeTab' | 'onTabChange'>) {
  return (
    <div className="self-start sticky top-[144px] w-full">
      <ProfileMenu tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

export function ProfileRightSidebar({
  name,
  handle,
  bio,
  avatar,
  isOwnProfile,
  isFollowing,
  onFollowClick,
  onEditClick,
  isLoadingFollow,
  tags,
  onAddTag,
  isLoadingTags,
  links,
}: Omit<ProfileSidebarsProps, 'tabs' | 'activeTab' | 'onTabChange'>) {
  return (
    <div className="self-start sticky top-[144px]">
      <ProfileInfo
        name={name!}
        handle={handle!}
        bio={bio}
        avatar={avatar}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollowClick={onFollowClick}
        onEditClick={onEditClick}
        isLoadingFollow={isLoadingFollow}
        tags={tags!}
        onAddTag={onAddTag}
        isLoadingTags={isLoadingTags}
        links={links!}
      />
    </div>
  );
}

export function ProfileLeftDrawer({
  tabs,
  activeTab,
  onTabChange,
}: Pick<ProfileSidebarsProps, 'tabs' | 'activeTab' | 'onTabChange'>) {
  return <ProfileMenu tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />;
}

export function ProfileRightDrawer({
  name,
  handle,
  bio,
  avatar,
  isOwnProfile,
  isFollowing,
  onFollowClick,
  onEditClick,
  isLoadingFollow,
  tags,
  onAddTag,
  isLoadingTags,
  links,
}: Omit<ProfileSidebarsProps, 'tabs' | 'activeTab' | 'onTabChange'>) {
  return (
    <ProfileInfo
      name={name!}
      handle={handle!}
      bio={bio}
      avatar={avatar}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      onFollowClick={onFollowClick}
      onEditClick={onEditClick}
      isLoadingFollow={isLoadingFollow}
      tags={tags!}
      onAddTag={onAddTag}
      isLoadingTags={isLoadingTags}
      links={links!}
    />
  );
}
