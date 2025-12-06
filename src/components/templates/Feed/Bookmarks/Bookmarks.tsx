'use client';

import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';

/**
 * Bookmarks Page Template
 *
 * Displays the user's bookmarked posts with filtering capabilities.
 * Reuses the same sidebar components from Home page for UI consistency.
 *
 * Sort and Content filters affect the bookmarks stream.
 * Reach filter is hidden as it's not supported by the Nexus API for bookmarks.
 */
export function Bookmarks() {
  const streamId = Hooks.useBookmarksStreamId();

  return (
    <Organisms.ContentLayout
      leftSidebarContent={<Organisms.HomeFeedSidebar hideReachFilter />}
      rightSidebarContent={<Organisms.HomeFeedRightSidebar />}
      leftDrawerContent={<Organisms.HomeFeedDrawer hideReachFilter />}
      rightDrawerContent={<Organisms.HomeFeedRightDrawer />}
      leftDrawerContentMobile={<Organisms.HomeFeedDrawerMobile hideReachFilter />}
      rightDrawerContentMobile={<Organisms.HomeFeedRightDrawerMobile />}
    >
      <Organisms.TimelinePosts streamId={streamId} />
    </Organisms.ContentLayout>
  );
}
