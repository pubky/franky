'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { AUTH_ROUTES, APP_ROUTES } from '@/app';
import { ProfileLeftSidebar, ProfileRightSidebar, ProfileLeftDrawer, ProfileRightDrawer } from './ProfilePage.sidebars';

// Mock data - replace with real data from your state management/API
const mockProfile = {
  name: 'John Doe',
  handle: '@johndoe',
  bio: 'Software engineer and open source enthusiast. Building the future of decentralized social networks.',
  avatar: undefined, // Will use fallback initials
  isOwnProfile: true,
};

const tabs = [
  { id: 'notifications', label: 'Notifications', icon: Libs.Bell, count: 5 },
  { id: 'posts', label: 'Posts', icon: Libs.StickyNote, count: 0 },
  { id: 'replies', label: 'Replies', icon: Libs.MessageSquare, count: 0 },
  { id: 'followers', label: 'Followers', icon: Libs.Users, count: 0 },
  { id: 'following', label: 'Following', icon: Libs.UsersRound2, count: 0 },
  { id: 'friends', label: 'Friends', icon: Libs.Heart, count: 0 },
  { id: 'tagged', label: 'Tagged', icon: Libs.Tag, count: 0 },
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

export function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('posts');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);

  // Reset to column layout on mount
  Hooks.useLayoutReset();

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

  const handleCreatePost = () => {
    // TODO: Open create post modal
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <Molecules.EmptyState
            icon={Libs.Bell}
            title="No notifications yet"
            description="When you get notifications, they'll show up here."
          />
        );

      case 'posts':
        return (
          <Molecules.EmptyState
            icon={Libs.StickyNote}
            title="No posts yet"
            description="Share your thoughts and ideas with the world. Your posts will appear here."
            action={{
              label: 'Create your first post',
              onClick: handleCreatePost,
            }}
          />
        );

      case 'replies':
        return (
          <Molecules.EmptyState
            icon={Libs.MessageSquare}
            title="No replies yet"
            description="Your replies to other posts will appear here."
          />
        );

      case 'followers':
        return (
          <Molecules.EmptyState
            icon={Libs.Users}
            title="No followers yet"
            description="People who follow you will appear here."
          />
        );

      case 'following':
        return (
          <Molecules.EmptyState
            icon={Libs.UsersRound2}
            title="Not following anyone yet"
            description="Discover and follow interesting people to see their posts in your feed."
            action={{
              label: 'Discover people',
              onClick: () => router.push(APP_ROUTES.SEARCH),
            }}
          />
        );

      case 'friends':
        return (
          <Molecules.EmptyState
            icon={Libs.Heart}
            title="No friends yet"
            description="People you follow who also follow you back will appear here."
          />
        );

      case 'tagged':
        return (
          <Molecules.EmptyState
            icon={Libs.Tag}
            title="No tags yet"
            description="Tags that others have added to your profile will appear here."
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Organisms.ContentLayout
        leftSidebarContent={<ProfileLeftSidebar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />}
        rightSidebarContent={
          <ProfileRightSidebar showUserCard={false} tags={mockTags} onAddTag={handleAddTag} links={mockLinks} />
        }
        leftDrawerContent={<ProfileLeftDrawer tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />}
        rightDrawerContent={
          <ProfileRightDrawer showUserCard={false} tags={mockTags} onAddTag={handleAddTag} links={mockLinks} />
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
          <Molecules.ProfileTabsMobile
            tabs={tabs.map((tab) => ({
              ...tab,
              onClick: () => setActiveTab(tab.id),
            }))}
            activeTab={activeTab}
          />
        </div>

        {/* Tab Content */}
        <div className="flex flex-col gap-6">{renderTabContent()}</div>
      </Organisms.ContentLayout>

      {/* Avatar Modal */}
      {isAvatarModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Atoms.Avatar size="xl" className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px]">
              <Atoms.AvatarImage src={mockProfile.avatar} alt={mockProfile.name} />
              <Atoms.AvatarFallback className="text-6xl">
                {Libs.extractInitials({ name: mockProfile.name, maxLength: 2 })}
              </Atoms.AvatarFallback>
            </Atoms.Avatar>
            <Atoms.Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              <Libs.X className="w-4 h-4" />
            </Atoms.Button>
          </div>
        </div>
      )}
    </>
  );
}
