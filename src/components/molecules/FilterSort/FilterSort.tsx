'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { SORT, type SortType } from '@/core/stores/filters/filters.types';

export type SortTab = SortType;

interface SortProps {
  selectedTab?: SortTab;
  onTabChange?: (tab: SortTab) => void;
}

const tabs: { key: SortTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: SORT.RECENT, label: 'Recent', icon: Libs.SquareAsterisk },
  { key: SORT.POPULARITY, label: 'Popularity', icon: Libs.Flame },
];

export function FilterSort({ selectedTab = SORT.RECENT, onTabChange }: SortProps) {
  const handleTabClick = (tab: SortTab) => {
    onTabChange?.(tab);
  };

  return (
    <Atoms.FilterRoot>
      <Atoms.FilterHeader title="Sort" />

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
