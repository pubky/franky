'use client';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';

// ============================================================================
// Home Feed Right Sidebar Components
// ============================================================================

/**
 * HomeFeedRightSidebar
 *
 * Right sidebar for Home feed - displays WhoToFollow, ActiveUsers, HotTags, FeedbackCard.
 * Desktop version.
 */
export function HomeFeedRightSidebar() {
  return (
    <>
      <Molecules.WhoToFollow />
      <Molecules.ActiveUsers />
      <Molecules.HotTags
        tags={[
          { name: 'bitcoin', count: 1234 },
          { name: 'nostr', count: 892 },
          { name: 'decentralization', count: 567 },
          { name: 'privacy', count: 445 },
          { name: 'web3', count: 321 },
          { name: 'opensource', count: 289 },
        ]}
      />
      <Organisms.FeedbackCard />
    </>
  );
}

/**
 * HomeFeedRightDrawer
 *
 * Right drawer for Home feed (tablet) - displays WhoToFollow, ActiveUsers, HotTags, FeedbackCard.
 */
export function HomeFeedRightDrawer() {
  return (
    <div className="flex flex-col gap-6">
      <Molecules.WhoToFollow />
      <Molecules.ActiveUsers />
      <Molecules.HotTags
        tags={[
          { name: 'bitcoin', count: 1234 },
          { name: 'nostr', count: 892 },
          { name: 'decentralization', count: 567 },
          { name: 'privacy', count: 445 },
          { name: 'web3', count: 321 },
          { name: 'opensource', count: 289 },
        ]}
      />
      <Organisms.FeedbackCard />
    </div>
  );
}

/**
 * HomeFeedRightDrawerMobile
 *
 * Right drawer for Home feed (mobile) - displays FeedSection.
 */
export function HomeFeedRightDrawerMobile() {
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
export function HotFeedRightSidebar() {
  return (
    <>
      <Molecules.WhoToFollow />
      <div className="sticky top-[100px] self-start">
        <Organisms.FeedbackCard />
      </div>
    </>
  );
}

/**
 * HotFeedRightDrawer
 *
 * Right drawer for Hot feed (tablet/mobile) - displays WhoToFollow, FeedbackCard.
 */
export function HotFeedRightDrawer() {
  return (
    <div className="flex flex-col gap-6">
      <Molecules.WhoToFollow />
      <Organisms.FeedbackCard />
    </div>
  );
}
