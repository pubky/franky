import * as Organisms from '@/organisms';

export function Home() {
  return (
    <>
      <Organisms.DialogWelcome />
      <Organisms.ContentLayout
        leftSidebarContent={<Organisms.HomeFeedSidebar />}
        rightSidebarContent={<Organisms.HomeFeedRightSidebar />}
        leftDrawerContent={<Organisms.HomeFeedDrawer />}
        rightDrawerContent={<Organisms.HomeFeedRightDrawer />}
        leftDrawerContentMobile={<Organisms.HomeFeedDrawerMobile />}
        rightDrawerContentMobile={<Organisms.HomeFeedRightDrawerMobile />}
      >
        <Organisms.AlertBackup />
        <Organisms.TimelinePosts />
      </Organisms.ContentLayout>
    </>
  );
}
