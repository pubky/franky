'use client';

import { useRouter } from 'next/navigation';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

// ============================================================================
// Shared Components
// ============================================================================

/**
 * HomeFeedContent
 *
 * Shared content for Home feed sidebars - WhoToFollow, ActiveUsers, HotTags, FeedbackCard.
 * Used by both HomeFeedRightSidebar (desktop) and HomeFeedRightDrawer (tablet).
 */
function HomeFeedContent() {
  const router = useRouter();
  const { tags } = Hooks.useHotTags();

  const handleTagClick = (tagName: string) => {
    router.push(`/search?tags=${encodeURIComponent(tagName)}`);
  };

  return (
    <>
      <Molecules.WhoToFollow />
      <Molecules.ActiveUsers />
      <Molecules.HotTags tags={tags} onTagClick={handleTagClick} />
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
export function HomeFeedRightSidebar() {
  return <HomeFeedContent />;
}

/**
 * HomeFeedRightDrawer
 *
 * Right drawer for Home feed (tablet) - displays WhoToFollow, ActiveUsers, HotTags, FeedbackCard.
 */
export function HomeFeedRightDrawer() {
  return (
    <div className="flex flex-col gap-6">
      <HomeFeedContent />
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
