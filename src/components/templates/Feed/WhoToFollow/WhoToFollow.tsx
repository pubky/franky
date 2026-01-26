'use client';

import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

/**
 * WhoToFollow Template
 *
 * Template for the Who To Follow page.
 * Displays a full list of recommended users to follow.
 *
 * Layout:
 * - Left sidebar: Sort options (disabled placeholders for now)
 * - Main content: Full list of recommended users with infinite scroll
 * - Right sidebar: ActiveUsers and FeedbackCard
 */
export function WhoToFollow() {
  // Reset to column layout on mount (this page doesn't support wide)
  Hooks.useLayoutReset();

  return (
    <Organisms.ContentLayout
      leftSidebarContent={<Organisms.WhoToFollowPageLeftSidebar />}
      rightSidebarContent={<Organisms.WhoToFollowPageRightSidebar />}
      leftDrawerContent={<Organisms.WhoToFollowPageLeftDrawer />}
      rightDrawerContent={<Organisms.WhoToFollowPageRightDrawer />}
    >
      <Organisms.WhoToFollowPageMain />
    </Organisms.ContentLayout>
  );
}
