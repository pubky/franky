import * as React from 'react';
import { ProfileMenu, ProfileMenuTab } from './ProfileMenu';
import { ProfileInfo, ProfileInfoTag, ProfileInfoLink } from './ProfileInfo';

interface ProfileSidebarsProps {
  tabs: ProfileMenuTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;

  // User info
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
  showUserCard,
  name,
  handle,
  bio,
  avatar,
  isFollowing,
  onFollowClick,
  isLoadingFollow,
  tags,
  onAddTag,
  isLoadingTags,
  links,
}: Omit<ProfileSidebarsProps, 'tabs' | 'activeTab' | 'onTabChange'>) {
  return (
    <div className="self-start sticky top-[144px]">
      <ProfileInfo
        showUserCard={showUserCard}
        name={name}
        handle={handle}
        bio={bio}
        avatar={avatar}
        isFollowing={isFollowing}
        onFollowClick={onFollowClick}
        isLoadingFollow={isLoadingFollow}
        tags={tags}
        onAddTag={onAddTag}
        isLoadingTags={isLoadingTags}
        links={links}
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
  showUserCard,
  name,
  handle,
  bio,
  avatar,
  isFollowing,
  onFollowClick,
  isLoadingFollow,
  tags,
  onAddTag,
  isLoadingTags,
  links,
}: Omit<ProfileSidebarsProps, 'tabs' | 'activeTab' | 'onTabChange'>) {
  return (
    <ProfileInfo
      showUserCard={showUserCard}
      name={name}
      handle={handle}
      bio={bio}
      avatar={avatar}
      isFollowing={isFollowing}
      onFollowClick={onFollowClick}
      isLoadingFollow={isLoadingFollow}
      tags={tags}
      onAddTag={onAddTag}
      isLoadingTags={isLoadingTags}
      links={links}
    />
  );
}
