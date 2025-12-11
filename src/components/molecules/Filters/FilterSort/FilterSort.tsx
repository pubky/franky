'use client';

import * as React from 'react';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Molecules from '@/molecules';

export function FilterSort({
  selectedTab,
  defaultSelectedTab = Core.SORT.TIMELINE,
  onTabChange,
}: Molecules.BaseFilterProps<Core.SortType>): React.ReactElement {
  const items = React.useMemo(
    () => [
      { key: Core.SORT.TIMELINE, label: 'Recent', icon: Libs.SquareAsterisk },
      { key: Core.SORT.ENGAGEMENT, label: 'Popularity', icon: Libs.Flame },
    ],
    [],
  );

  return (
    <Molecules.FilterRadioGroup
      title="Sort"
      items={items}
      selectedValue={selectedTab}
      defaultValue={defaultSelectedTab}
      onChange={onTabChange}
    />
  );
}
