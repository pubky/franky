'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';

// ============================================================================
// Types
// ============================================================================

export type TimeframeTab = 'today' | 'thisMonth' | 'allTime';

export interface HotFeedFiltersProps {
  reach: Core.ReachType;
  setReach: (reach: Core.ReachType) => void;
  timeframe: TimeframeTab;
  setTimeframe: (timeframe: TimeframeTab) => void;
}

// ============================================================================
// FilterTimeframe Component
// ============================================================================

interface FilterTimeframeProps {
  selectedTab?: TimeframeTab;
  onTabChange?: (tab: TimeframeTab) => void;
}

const timeframeTabs: { key: TimeframeTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'today', label: 'Today', icon: Libs.Star },
  { key: 'thisMonth', label: 'This Month', icon: Libs.Calendar },
  { key: 'allTime', label: 'All Time', icon: Libs.Clock },
];

/**
 * FilterTimeframe
 *
 * Filter component for selecting timeframe (Today, This Month, All Time).
 */
export function FilterTimeframe({ selectedTab = 'today', onTabChange }: FilterTimeframeProps) {
  const handleTabClick = (tab: TimeframeTab) => {
    onTabChange?.(tab);
  };

  return (
    <Atoms.FilterRoot>
      <Atoms.FilterHeader title="Timeframe" />
      <Atoms.FilterList>
        {timeframeTabs.map(({ key, label, icon: Icon }) => {
          const isSelected = selectedTab === key;
          return (
            <Atoms.FilterItem key={key} isSelected={isSelected} onClick={() => handleTabClick(key)}>
              <Atoms.FilterItemIcon icon={Icon} />
              <Atoms.FilterItemLabel>{label}</Atoms.FilterItemLabel>
            </Atoms.FilterItem>
          );
        })}
      </Atoms.FilterList>
    </Atoms.FilterRoot>
  );
}

// ============================================================================
// Sidebar & Drawer Components
// ============================================================================

/**
 * HotFeedSidebar
 *
 * Left sidebar for Hot feed - displays reach and timeframe filters.
 * Desktop version with sticky positioning.
 */
export function HotFeedSidebar({ reach, setReach, timeframe, setTimeframe }: HotFeedFiltersProps) {
  return (
    <>
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <div className="sticky top-[100px] w-full self-start">
        <FilterTimeframe selectedTab={timeframe} onTabChange={setTimeframe} />
      </div>
    </>
  );
}

/**
 * HotFeedDrawer
 *
 * Left drawer for Hot feed (tablet/mobile) - displays reach and timeframe filters.
 */
export function HotFeedDrawer({ reach, setReach, timeframe, setTimeframe }: HotFeedFiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <FilterTimeframe selectedTab={timeframe} onTabChange={setTimeframe} />
    </div>
  );
}
