'use client';

import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';

export function Home() {
  const streamId = Hooks.useStreamIdFromFilters();
  const { postIds, loading, loadingMore, error, hasMore, loadMore, prependPosts } = Hooks.useStreamPagination({
    streamId,
  });

  const handlePostSuccess = (createdPostId: string) => {
    // Optimistically add the new post to the top of the timeline
    prependPosts(createdPostId);
  };

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
        <Organisms.PostInput variant={POST_INPUT_VARIANT.POST} onSuccess={handlePostSuccess} />
        <Organisms.TimelinePosts
          postIds={postIds}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      </Organisms.ContentLayout>
    </>
  );
}
