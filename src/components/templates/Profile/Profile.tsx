'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import { PROFILE_ROUTES } from '@/app';

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

  const currentUserPubky = Core.useAuthStore((state) => state.currentUserPubky);
  const pathname = usePathname();
  const isTaggedPage = pathname === PROFILE_ROUTES.TAGGED;

  return (
    <>
      {/* Profile header - visible on desktop always, on mobile only for tagged page */}
      <div className={Libs.cn('max-w-5xl xl:max-w-6xl m-auto px-6 xl:px-0 pb-6', !isTaggedPage && 'lg:block hidden')}>
        <Organisms.ProfileHeader
          name={profileInfo?.name || 'User'}
          handle={profileInfo?.handle || '@user'}
          bio={profileInfo?.bio}
          avatar={profileInfo?.avatar}
          isOwnProfile={!!currentUserPubky}
        />
      </div>

      {/* Mobile menu - visible only on mobile, full width */}
      <Molecules.ProfileMobileMenu counts={profileCounts} className="lg:hidden" />

      <div className={Libs.cn(isTaggedPage ? 'mt-6 lg:mt-0' : 'mt-36 lg:mt-0')}>
        <Organisms.ContentLayout
          showLeftMobileButton={false}
          showRightMobileButton={false}
          leftSidebarContent={<ProfileLeftSidebar counts={profileCounts} />}
          rightSidebarContent={<ProfileRightSidebar profileInfo={profileInfo} />}
          className="pt-0"
        >
          {children}
        </Organisms.ContentLayout>
      </div>
    </>
  );
}

export function ProfileLeftSidebar({ counts }: { counts?: ProfileProps['profileCounts'] }) {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Menu Section */}
      <Molecules.ProfileMenu counts={counts} />

      {/* Invite Codes Section */}
      <Molecules.InviteCodes />
    </div>
  );
}

export function ProfileRightSidebar({ profileInfo }: { profileInfo?: ProfileProps['profileInfo'] }) {
  return <Molecules.ProfileInfo links={profileInfo?.links} tags={profileInfo?.tags} />;
}
