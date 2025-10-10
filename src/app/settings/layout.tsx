'use client';

import * as React from 'react';
import * as Organisms from '@/organisms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import {
  SettingsLeftSidebar,
  SettingsRightSidebar,
  SettingsLeftDrawer,
  SettingsRightDrawer,
} from '@/templates/Settings/Settings.sidebars';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
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
