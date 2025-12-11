'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

// ============================================================================
// Shared Components
// ============================================================================

/**
 * HomeFeedContent
 *
 * Shared content for Home feed sidebars - WhoToFollow, ActiveUsers, HotTags, FeedbackCard.
 * Used by both HomeFeedRightSidebar (desktop) and HomeFeedRightDrawer (tablet).
 */
function HomeFeedContent(): React.ReactElement {
  return (
    <>
      <Organisms.WhoToFollow />
      <Organisms.ActiveUsers />
      <Organisms.HotTags />
      <Organisms.FeedbackCard />
    </>
  );
}

// ============================================================================
// Home Feed Right Sidebar Components
// ============================================================================

/**
 * HomeFeedRightSidebar
 *
 * Right sidebar for Home feed - displays WhoToFollow, ActiveUsers, HotTags, FeedbackCard.
 * Desktop version.
 */
export function HomeFeedRightSidebar(): React.ReactElement {
  return <HomeFeedContent />;
}

/**
 * HomeFeedRightDrawer
 *
 * Right drawer for Home feed (tablet) - displays WhoToFollow, ActiveUsers, HotTags, FeedbackCard.
 */
export function HomeFeedRightDrawer(): React.ReactElement {
  return (
    <Atoms.Container overrideDefaults className="flex flex-col gap-6">
      <HomeFeedContent />
    </Atoms.Container>
  );
}

/**
 * HomeFeedRightDrawerMobile
 *
 * Right drawer for Home feed (mobile) - displays FeedSection.
 */
export function HomeFeedRightDrawerMobile(): React.ReactElement {
  return (
    <Molecules.FeedSection
      feeds={[
        { icon: Libs.UsersRound, label: 'Following' },
        { icon: Libs.Pencil, label: 'Based bitcoin' },
        { icon: Libs.Pencil, label: 'Mining industry' },
      ]}
      showCreateButton={true}
    />
  );
}

// ============================================================================
// Hot Feed Right Sidebar Components
// ============================================================================

/**
 * HotFeedRightSidebar
 *
 * Right sidebar for Hot feed - displays WhoToFollow, FeedbackCard.
 * Desktop version with sticky positioning.
 */
export function HotFeedRightSidebar(): React.ReactElement {
  return (
    <>
      <Organisms.WhoToFollow />
      <Atoms.Container overrideDefaults className="sticky top-[100px] self-start">
        <Organisms.FeedbackCard />
      </Atoms.Container>
    </>
  );
}

/**
 * HotFeedRightDrawer
 *
 * Right drawer for Hot feed (tablet/mobile) - displays WhoToFollow, FeedbackCard.
 */
export function HotFeedRightDrawer(): React.ReactElement {
  return (
    <Atoms.Container overrideDefaults className="flex flex-col gap-6">
      <Organisms.WhoToFollow />
      <Organisms.FeedbackCard />
    </Atoms.Container>
  );
}
