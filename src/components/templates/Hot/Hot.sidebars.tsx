import * as Molecules from '@/molecules';
import * as Core from '@/core';
import { FilterTimeframe } from './FilterTimeframe';

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
      <div className="self-start sticky top-[100px]">
        <FilterTimeframe selectedTab={timeframe} onTabChange={setTimeframe} />
      </div>
    </>
  );
}

export function HotRightSidebar() {
  return (
    <>
      <Molecules.WhoToFollow />
      <div className="self-start sticky top-[100px]">
        <Molecules.FeedbackCard />
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
      <Molecules.FeedbackCard />
    </div>
  );
}
