'use client';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Sidebars from './Home.sidebars';

export function Home() {
  return (
    <>
      <Organisms.DialogWelcome />
      <Organisms.ContentLayout
        leftSidebarContent={<Sidebars.HomeLeftSidebar />}
        rightSidebarContent={<Sidebars.HomeRightSidebar />}
        leftDrawerContent={<Sidebars.HomeLeftDrawer />}
        rightDrawerContent={<Sidebars.HomeRightDrawer />}
        leftDrawerContentMobile={<Sidebars.HomeLeftDrawerMobile />}
        rightDrawerContentMobile={<Sidebars.HomeRightDrawerMobile />}
      >
        <Organisms.AlertBackup />
        <Molecules.HomeHeader />
        <Organisms.Timeline />
      </Organisms.ContentLayout>
    </>
  );
}
