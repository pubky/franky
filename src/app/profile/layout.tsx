'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PROFILE_ROUTES } from '@/app';
import * as Molecules from '@/components/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import { PROFILE_PAGE_TYPES, ProfilePageType, FilterBarPageType } from './types';

const PAGE_PATH_MAP: Record<string, ProfilePageType> = {
  [PROFILE_ROUTES.PROFILE]: PROFILE_PAGE_TYPES.NOTIFICATIONS,
  [PROFILE_ROUTES.NOTIFICATIONS]: PROFILE_PAGE_TYPES.NOTIFICATIONS,
  [PROFILE_ROUTES.POSTS]: PROFILE_PAGE_TYPES.POSTS,
  [PROFILE_ROUTES.REPLIES]: PROFILE_PAGE_TYPES.REPLIES,
  [PROFILE_ROUTES.FOLLOWERS]: PROFILE_PAGE_TYPES.FOLLOWERS,
  [PROFILE_ROUTES.FOLLOWING]: PROFILE_PAGE_TYPES.FOLLOWING,
  [PROFILE_ROUTES.FRIENDS]: PROFILE_PAGE_TYPES.FRIENDS,
  [PROFILE_ROUTES.TAGGED]: PROFILE_PAGE_TYPES.TAGGED,
  [PROFILE_ROUTES.PROFILE_PAGE]: PROFILE_PAGE_TYPES.PROFILE,
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUserPubky } = Core.useAuthStore();
  const { profileData, handlers, isLoading } = Hooks.useProfileHeader(currentUserPubky ?? '');

  const activePage = React.useMemo(() => {
    return PAGE_PATH_MAP[pathname] || PROFILE_PAGE_TYPES.NOTIFICATIONS;
  }, [pathname]);

  const setActivePage = (page: ProfilePageType) => {
    const routeMap: Record<ProfilePageType, string> = {
      [PROFILE_PAGE_TYPES.NOTIFICATIONS]: PROFILE_ROUTES.PROFILE,
      [PROFILE_PAGE_TYPES.POSTS]: PROFILE_ROUTES.POSTS,
      [PROFILE_PAGE_TYPES.REPLIES]: PROFILE_ROUTES.REPLIES,
      [PROFILE_PAGE_TYPES.FOLLOWERS]: PROFILE_ROUTES.FOLLOWERS,
      [PROFILE_PAGE_TYPES.FOLLOWING]: PROFILE_ROUTES.FOLLOWING,
      [PROFILE_PAGE_TYPES.FRIENDS]: PROFILE_ROUTES.FRIENDS,
      [PROFILE_PAGE_TYPES.TAGGED]: PROFILE_ROUTES.TAGGED,
      [PROFILE_PAGE_TYPES.PROFILE]: PROFILE_ROUTES.PROFILE_PAGE,
    };
    router.push(routeMap[page]);
  };

  const filterBarActivePage =
    activePage === PROFILE_PAGE_TYPES.PROFILE ? PROFILE_PAGE_TYPES.NOTIFICATIONS : (activePage as FilterBarPageType);

  return (
    <>
      <Molecules.MobileHeader showLeftButton={false} showRightButton={false} />

      <Molecules.ProfilePageMobileMenu activePage={activePage} onPageChangeAction={setActivePage} />

      <Molecules.ProfilePageLayoutWrapper>
        <div className="hidden bg-background pb-6 shadow-sm lg:block">
          {!isLoading && <Organisms.ProfilePageHeader {...profileData} {...handlers} />}
        </div>

        <div className="flex gap-6">
          <Molecules.ProfilePageFilterBar
            activePage={filterBarActivePage}
            onPageChangeAction={(page) => setActivePage(page)}
          />

          <div className="flex-1">{children}</div>
          <Molecules.ProfilePageSidebar />
        </div>
      </Molecules.ProfilePageLayoutWrapper>

      <Molecules.MobileFooter />
    </>
  );
}
