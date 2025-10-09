'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export type TimeframeTab = 'today' | 'thisMonth' | 'allTime';

interface TimeframeProps {
  selectedTab?: TimeframeTab;
  onTabChange?: (tab: TimeframeTab) => void;
}

const tabs: { key: TimeframeTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'today', label: 'Today', icon: Libs.SquareAsterisk },
  { key: 'thisMonth', label: 'This Month', icon: Libs.Calendar },
  { key: 'allTime', label: 'All Time', icon: Libs.Clock },
];

export function FilterTimeframe({ selectedTab = 'today', onTabChange }: TimeframeProps) {
  const handleTabClick = (tab: TimeframeTab) => {
    onTabChange?.(tab);
  };

  return (
    <Atoms.FilterRoot>
      <Atoms.FilterHeader title="Timeframe" />

      <Atoms.FilterList>
        {tabs.map(({ key, label, icon: Icon }) => {
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
