import * as Molecules from '@/molecules';
import * as Core from '@/core';
import { FilterTimeframe } from './FilterTimeframe';
import * as Organisms from '@/organisms';

export interface HotSidebarProps {
  reach: Core.ReachType;
  setReach: (reach: Core.ReachType) => void;
  timeframe: 'today' | 'thisMonth' | 'allTime';
  setTimeframe: (timeframe: 'today' | 'thisMonth' | 'allTime') => void;
}

export function HotLeftSidebar({ reach, setReach, timeframe, setTimeframe }: HotSidebarProps) {
  return (
    <>
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <div className="sticky top-[100px] w-full self-start">
        <FilterTimeframe selectedTab={timeframe} onTabChange={setTimeframe} />
      </div>
    </>
  );
}

export function HotRightSidebar() {
  return (
    <>
      <Molecules.WhoToFollow />
      <div className="sticky top-[100px] self-start">
        <Organisms.FeedbackCard />
      </div>
    </>
  );
}

export function HotLeftDrawer({ reach, setReach, timeframe, setTimeframe }: HotSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <FilterTimeframe selectedTab={timeframe} onTabChange={setTimeframe} />
    </div>
  );
}

export function HotRightDrawer() {
  return (
    <div className="flex flex-col gap-6">
      <Molecules.WhoToFollow />
      <Organisms.FeedbackCard />
    </div>
  );
}
