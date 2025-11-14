'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AUTH_ROUTES, PROFILE_ROUTES } from '@/app';
import * as Molecules from '@/components/molecules';
import * as Organisms from '@/organisms';
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

  const handleLogout = () => {
    router.push(AUTH_ROUTES.LOGOUT);
  };

  const filterBarActivePage =
    activePage === PROFILE_PAGE_TYPES.PROFILE ? PROFILE_PAGE_TYPES.NOTIFICATIONS : (activePage as FilterBarPageType);

  return (
    <>
      <Molecules.MobileHeader showLeftButton={false} showRightButton={false} />

      <Molecules.ProfilePageMobileMenu activePage={activePage} onPageChangeAction={setActivePage} />

      <Molecules.ProfilePageLayoutWrapper>
        <div className="sticky top-[146px] z-20 hidden bg-background pb-6 shadow-sm lg:block">
          <Organisms.ProfilePageHeader
            name="Satoshi Nakamoto"
            bio="Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared."
            publicKey="1QX7GKW3abcdef1234567890"
            emoji="🌴"
            status="Vacationing"
            onEdit={() => console.log('Edit clicked')}
            onCopyPublicKey={() => console.log('Copy public key clicked')}
            onLinkClick={() => console.log('Link clicked')}
            onSignOut={handleLogout}
            onStatusClick={() => console.log('Status clicked')}
          />
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
