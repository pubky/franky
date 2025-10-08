import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';

export interface HomeSidebarProps {
  reach: Core.ReachType;
  setReach: (reach: Core.ReachType) => void;
  sort: Core.SortType;
  setSort: (sort: Core.SortType) => void;
  content: Core.ContentType;
  setContent: (content: Core.ContentType) => void;
  layout: Core.LayoutType;
  setLayout: (layout: Core.LayoutType) => void;
}

export function HomeLeftSidebar({
  reach,
  setReach,
  sort,
  setSort,
  content,
  setContent,
  layout,
  setLayout,
}: HomeSidebarProps) {
  return (
    <>
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
      <div className="self-start sticky top-[100px] flex flex-col gap-6">
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
      <div className="self-start sticky top-[100px]">
        <Molecules.FeedbackCard />
      </div>
    </>
  );
}

export function HomeLeftDrawer({
  reach,
  setReach,
  sort,
  setSort,
  content,
  setContent,
  layout,
  setLayout,
}: HomeSidebarProps) {
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

export function HomeLeftDrawerMobile({
  reach,
  setReach,
  sort,
  setSort,
  content,
  setContent,
}: Omit<HomeSidebarProps, 'layout' | 'setLayout'>) {
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
