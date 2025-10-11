'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { AUTH_ROUTES, APP_ROUTES } from '@/app';
import {
  ProfileLeftSidebar,
  ProfileRightSidebar,
  ProfileLeftDrawer,
  ProfileRightDrawer,
} from './ProfileLayout.sidebars';

// Mock data - replace with real data from your state management/API
const mockProfile = {
  name: 'John Doe',
  handle: '@johndoe',
  bio: 'Software engineer and open source enthusiast. Building the future of decentralized social networks.',
  avatar: undefined, // Will use fallback initials
  isOwnProfile: true,
};

const tabs = [
  { id: 'notifications', label: 'Notifications', icon: Libs.Bell, count: 5, route: APP_ROUTES.PROFILE_NOTIFICATIONS },
  { id: 'posts', label: 'Posts', icon: Libs.StickyNote, count: 0, route: APP_ROUTES.PROFILE_POSTS },
  { id: 'replies', label: 'Replies', icon: Libs.MessageSquare, count: 0, route: APP_ROUTES.PROFILE_REPLIES },
  { id: 'followers', label: 'Followers', icon: Libs.Users, count: 0, route: APP_ROUTES.PROFILE_FOLLOWERS },
  { id: 'following', label: 'Following', icon: Libs.UsersRound2, count: 0, route: APP_ROUTES.PROFILE_FOLLOWING },
  { id: 'friends', label: 'Friends', icon: Libs.Heart, count: 0, route: APP_ROUTES.PROFILE_FRIENDS },
  { id: 'tagged', label: 'Tagged', icon: Libs.Tag, count: 0, route: APP_ROUTES.PROFILE_TAGGED },
];

const mockTags = [
  { label: 'developer', count: 45, isSelected: true, onClick: () => {} },
  { label: 'opensource', count: 32, isSelected: false, onClick: () => {} },
  { label: 'blockchain', count: 28, isSelected: true, onClick: () => {} },
];

const mockLinks = [
  { title: 'Twitter', url: 'https://twitter.com/johndoe' },
  { title: 'GitHub', url: 'https://github.com/johndoe' },
  { title: 'Email', url: 'mailto:john@example.com' },
];

export interface ProfileLayoutProps {
  children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);

  // Reset to column layout on mount
  Hooks.useLayoutReset();

  // Determine active tab from pathname
  const activeTab = React.useMemo(() => {
    const tab = tabs.find((t) => pathname === t.route);
    return tab?.id || 'posts';
  }, [pathname]);

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      router.push(tab.route);
    }
  };

  const handleLogout = () => {
    router.push(AUTH_ROUTES.LOGOUT);
  };

  const handleEdit = () => {
    router.push(APP_ROUTES.PROFILE_EDIT);
  };

  const handleCopyPubkey = async () => {
    await navigator.clipboard.writeText(`pk:${mockProfile.handle}`);
    // TODO: Show toast notification
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/profile/${mockProfile.handle}`);
    // TODO: Show toast notification
  };

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true);
  };

  const handleAddTag = () => {
    // TODO: Open tag modal
  };

  return (
    <Organisms.ContentLayout
      leftSidebarContent={<ProfileLeftSidebar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />}
      rightSidebarContent={
        <ProfileRightSidebar
          name={mockProfile.name}
          handle={mockProfile.handle}
          bio={mockProfile.bio}
          avatar={mockProfile.avatar}
          isOwnProfile={mockProfile.isOwnProfile}
          onEditClick={handleEdit}
          tags={mockTags}
          onAddTag={handleAddTag}
          links={mockLinks}
        />
      }
      leftDrawerContent={<ProfileLeftDrawer tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />}
      leftDrawerContentMobile={
        <Molecules.ProfileTabsMobile tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      }
      rightDrawerContent={
        <ProfileRightDrawer
          name={mockProfile.name}
          handle={mockProfile.handle}
          bio={mockProfile.bio}
          avatar={mockProfile.avatar}
          isOwnProfile={mockProfile.isOwnProfile}
          onEditClick={handleEdit}
          tags={mockTags}
          onAddTag={handleAddTag}
          links={mockLinks}
        />
      }
    >
      {/* Profile Header */}
      <Organisms.ProfileHeader
        name={mockProfile.name}
        handle={mockProfile.handle}
        bio={mockProfile.bio}
        avatar={mockProfile.avatar}
        isOwnProfile={mockProfile.isOwnProfile}
        onEditClick={handleEdit}
        onLogoutClick={handleLogout}
        onCopyPubkey={handleCopyPubkey}
        onCopyLink={handleCopyLink}
        onAvatarClick={handleAvatarClick}
      />

      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <Molecules.ProfileTabsMobile tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Main Content Area - Renders children (subpages) */}
      <div className="flex flex-col gap-6">{children}</div>

      {/* Avatar Modal */}
      <Atoms.Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <Atoms.DialogContent className="p-0 border-none bg-transparent max-w-fit">
          <Molecules.ProfileAvatar
            src={mockProfile.avatar}
            alt={mockProfile.name}
            size="xl"
            className="w-[362px] h-[362px]"
          />
        </Atoms.DialogContent>
      </Atoms.Dialog>
    </Organisms.ContentLayout>
  );
}
