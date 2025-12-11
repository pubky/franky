'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';

// ============================================================================
// FilterTimeframe Component
// ============================================================================

interface FilterTimeframeProps {
  selectedTab?: Core.TimeframeType;
  onTabChange?: (tab: Core.TimeframeType) => void;
}

const timeframeTabs: { key: Core.TimeframeType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: Core.TIMEFRAME.TODAY, label: 'Today', icon: Libs.Star },
  { key: Core.TIMEFRAME.THIS_MONTH, label: 'This Month', icon: Libs.Calendar },
  { key: Core.TIMEFRAME.ALL_TIME, label: 'All Time', icon: Libs.Clock },
];

/**
 * FilterTimeframe
 *
 * Filter component for selecting timeframe (Today, This Month, All Time).
 */
export function FilterTimeframe({
  selectedTab = Core.TIMEFRAME.TODAY,
  onTabChange,
}: FilterTimeframeProps): React.ReactElement {
  const handleTabClick = (tab: Core.TimeframeType): void => {
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
 * Uses the hot store for state management.
 * Desktop version with sticky positioning.
 */
export function HotFeedSidebar(): React.ReactElement {
  const { reach, setReach, timeframe, setTimeframe } = Core.useHotStore();

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
 * Uses the hot store for state management.
 */
export function HotFeedDrawer(): React.ReactElement {
  const { reach, setReach, timeframe, setTimeframe } = Core.useHotStore();

  return (
    <div className="flex flex-col gap-6">
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <FilterTimeframe selectedTab={timeframe} onTabChange={setTimeframe} />
    </div>
  );
}
