'use client';

import * as React from 'react';
import * as Organisms from '@/organisms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Core from '@/core';

export interface ProfileProps {
  children: React.ReactNode;
  profileCounts?: {
    posts?: number;
    replies?: number;
    tagged?: number;
    followers?: number;
    following?: number;
    friends?: number;
  };
  profileInfo?: {
    name?: string;
    handle?: string;
    avatar?: string;
    bio?: string;
    links?: Array<{ label: string; url: string }>;
    tags?: Array<{ label: string; count: number }>;
  };
}

export function Profile({ children, profileCounts, profileInfo }: ProfileProps) {
  // Reset to column layout on mount (this page doesn't support wide)
  Hooks.useLayoutReset();

  // Get current user for checking if it's own profile
  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);

  return (
    <>
      {/* Profile Header - ABOVE everything, full width */}
      <div className="max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl w-full m-auto px-6 xl:px-0 pb-6">
        <Organisms.ProfileHeader
          name={profileInfo?.name || 'User'}
          handle={profileInfo?.handle || '@user'}
          bio={profileInfo?.bio}
          avatar={profileInfo?.avatar}
          isOwnProfile={!!currentUserPubky}
        />
      </div>

      {/* Mobile menu - visible only on mobile, full width */}
      <div className="lg:hidden">
        <Molecules.ProfileMobileMenu counts={profileCounts} />
      </div>

      <Organisms.ContentLayout
        showLeftMobileButton={false}
        showRightMobileButton={false}
        leftSidebarContent={<ProfileLeftSidebar counts={profileCounts} />}
        rightSidebarContent={<ProfileRightSidebar profileInfo={profileInfo} />}
        leftDrawerContent={<ProfileLeftDrawer counts={profileCounts} />}
        rightDrawerContent={<ProfileRightDrawer profileInfo={profileInfo} />}
        className="pt-0"
      >
        {children}
      </Organisms.ContentLayout>
    </>
  );
}

export function ProfileLeftSidebar({ counts }: { counts?: ProfileProps['profileCounts'] }) {
  return (
    <div className="self-start sticky top-[100px] w-full">
      <Molecules.ProfileMenu counts={counts} />
    </div>
  );
}

export function ProfileRightSidebar({ profileInfo }: { profileInfo?: ProfileProps['profileInfo'] }) {
  return (
    <div className="self-start sticky top-[100px]">
      <Molecules.ProfileInfo links={profileInfo?.links} tags={profileInfo?.tags} />
    </div>
  );
}

export function ProfileLeftDrawer({ counts }: { counts?: ProfileProps['profileCounts'] }) {
  return <Molecules.ProfileMenu counts={counts} />;
}

export function ProfileRightDrawer({ profileInfo }: { profileInfo?: ProfileProps['profileInfo'] }) {
  return <Molecules.ProfileInfo links={profileInfo?.links} tags={profileInfo?.tags} />;
}
