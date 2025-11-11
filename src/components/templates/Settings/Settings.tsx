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
      <Molecules.SettingsMobileMenu className="lg:hidden" />

      <Organisms.ContentLayout
        showLeftMobileButton={false}
        showRightMobileButton={false}
        leftSidebarContent={<SettingsLeftSidebar />}
        rightSidebarContent={<SettingsRightSidebar />}
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
