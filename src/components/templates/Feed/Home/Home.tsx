import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';

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
        <Organisms.PostInput variant={POST_INPUT_VARIANT.POST} />
        <Organisms.TimelinePosts />
      </Organisms.ContentLayout>
    </>
  );
}
