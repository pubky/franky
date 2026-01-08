'use client';

import * as React from 'react';
import * as Organisms from '@/organisms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export interface SettingsProps {
  children: React.ReactNode;
}

export function Settings({ children }: SettingsProps) {
  // Reset to column layout on mount (this page doesn't support wide)
  Hooks.useLayoutReset();

  return (
    <>
      {/* Mobile menu - visible only on mobile, full width */}
      <div className="lg:hidden">
        <Molecules.SettingsMobileMenu />
      </div>

      <Organisms.ContentLayout
        showLeftMobileButton={false}
        showRightMobileButton={false}
        leftSidebarContent={<SettingsLeftSidebar />}
        rightSidebarContent={<SettingsRightSidebar />}
        leftDrawerContent={<SettingsLeftDrawer />}
        rightDrawerContent={<SettingsRightDrawer />}
        className="pt-[118px] lg:pt-0"
      >
        {children}
      </Organisms.ContentLayout>
    </>
  );
}

export function SettingsLeftSidebar() {
  return (
    <div className="sticky top-[100px] w-full self-start">
      <Molecules.SettingsMenu />
    </div>
  );
}

export function SettingsRightSidebar() {
  return (
    <div className="sticky top-[100px] self-start">
      <Molecules.SettingsInfo />
    </div>
  );
}

export function SettingsLeftDrawer() {
  return <Molecules.SettingsMenu />;
}

export function SettingsRightDrawer() {
  return <Molecules.SettingsInfo />;
}
