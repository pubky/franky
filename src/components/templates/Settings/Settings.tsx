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
        className="lg:pt-0 pt-[145px]"
      >
        {children}
      </Organisms.ContentLayout>
    </>
  );
}

export function SettingsLeftSidebar() {
  return (
    <div className="self-start sticky top-[100px] w-full">
      <Molecules.SettingsMenu />
    </div>
  );
}

export function SettingsRightSidebar() {
  return (
    <div className="self-start sticky top-[100px]">
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
