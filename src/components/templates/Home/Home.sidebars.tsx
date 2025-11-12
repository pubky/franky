import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';

/**
 * HomeLeftSidebar
 *
 * Self-contained component that manages its own filter state.
 * No props needed - uses global filters store.
 */
export function HomeLeftSidebar() {
  const { layout, setLayout, reach, setReach, sort, setSort, content, setContent } = Core.useFiltersStore();

  return (
    <>
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
      <div className="sticky top-[100px] flex w-full flex-col gap-6 self-start">
        <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
        <Molecules.FilterLayout selectedTab={layout} onTabChange={setLayout} />
      </div>
    </>
  );
}

export function HomeRightSidebar() {
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
      <Molecules.FeedbackCard />
    </>
  );
}

/**
 * HomeLeftDrawer
 *
 * Self-contained component that manages its own filter state.
 * No props needed - uses global filters store.
 */
export function HomeLeftDrawer() {
  const { layout, setLayout, reach, setReach, sort, setSort, content, setContent } = Core.useFiltersStore();

  return (
    <div className="flex flex-col gap-6">
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
      <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
      <Molecules.FilterLayout selectedTab={layout} onTabChange={setLayout} />
    </div>
  );
}

export function HomeRightDrawer() {
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
      <Molecules.FeedbackCard />
    </div>
  );
}

/**
 * HomeLeftDrawerMobile
 *
 * Self-contained component that manages its own filter state.
 * No props needed - uses global filters store.
 * Note: Mobile version doesn't show layout filter.
 */
export function HomeLeftDrawerMobile() {
  const { reach, setReach, sort, setSort, content, setContent } = Core.useFiltersStore();

  return (
    <div className="flex flex-col gap-6">
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
      <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
    </div>
  );
}

export function HomeRightDrawerMobile() {
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
