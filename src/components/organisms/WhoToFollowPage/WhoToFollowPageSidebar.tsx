'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

/**
 * WhoToFollowPageLeftSidebar
 *
 * Left sidebar for Who To Follow page (desktop).
 * Displays sort options (currently disabled placeholders).
 */
export function WhoToFollowPageLeftSidebar() {
  return <Molecules.FilterSortWhoToFollow />;
}

/**
 * WhoToFollowPageLeftDrawer
 *
 * Left drawer for Who To Follow page (tablet).
 * Contains sort options wrapped in container with proper spacing.
 */
export function WhoToFollowPageLeftDrawer() {
  return (
    <Atoms.Container overrideDefaults className="flex flex-col gap-6">
      <Molecules.FilterSortWhoToFollow />
    </Atoms.Container>
  );
}

/**
 * WhoToFollowPageRightSidebar
 *
 * Right sidebar for Who To Follow page (desktop).
 * Displays ActiveUsers and FeedbackCard.
 */
export function WhoToFollowPageRightSidebar() {
  return (
    <>
      <Organisms.ActiveUsers />
      <Atoms.Container overrideDefaults className="sticky top-[100px] self-start">
        <Organisms.FeedbackCard />
      </Atoms.Container>
    </>
  );
}

/**
 * WhoToFollowPageRightDrawer
 *
 * Right drawer for Who To Follow page (tablet).
 * Contains ActiveUsers and FeedbackCard with proper spacing.
 */
export function WhoToFollowPageRightDrawer() {
  return (
    <Atoms.Container overrideDefaults className="flex flex-col gap-6">
      <Organisms.ActiveUsers />
      <Organisms.FeedbackCard />
    </Atoms.Container>
  );
}
