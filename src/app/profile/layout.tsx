'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { currentUserPubky } = Core.useAuthStore();
  const { profile, stats, actions, isLoading } = Hooks.useProfileHeader(currentUserPubky ?? '');
  const { activePage, filterBarActivePage, navigateToPage } = Hooks.useProfileNavigation();

  return (
    <>
      <Molecules.MobileHeader showLeftButton={false} showRightButton={false} />

      <Molecules.ProfilePageMobileMenu activePage={activePage} onPageChangeAction={navigateToPage} />

      <Molecules.ProfilePageLayoutWrapper>
        <Atoms.Container overrideDefaults={true} className="hidden bg-background pb-6 shadow-sm lg:block">
          {!isLoading && <Organisms.ProfilePageHeader profile={profile} actions={actions} />}
        </Atoms.Container>

        <Atoms.Container overrideDefaults={true} className="flex gap-6">
          <Molecules.ProfilePageFilterBar
            activePage={filterBarActivePage}
            onPageChangeAction={navigateToPage}
            stats={stats}
          />

          <Atoms.Container overrideDefaults={true} className="flex-1">
            {children}
          </Atoms.Container>
          <Molecules.ProfilePageSidebar />
        </Atoms.Container>
      </Molecules.ProfilePageLayoutWrapper>

      <Molecules.MobileFooter />
    </>
  );
}
