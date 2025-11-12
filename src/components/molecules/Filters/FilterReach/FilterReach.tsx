'use client';

import * as React from 'react';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Molecules from '@/molecules';

export function FilterReach({
  selectedTab,
  defaultSelectedTab = Core.REACH.ALL,
  onTabChange,
}: Molecules.BaseFilterProps<Core.ReachType>) {
  const items = React.useMemo(
    () => [
      { key: Core.REACH.ALL, label: 'All', icon: Libs.Radio },
      { key: Core.REACH.FOLLOWING, label: 'Following', icon: Libs.UsersRound2 },
      { key: Core.REACH.FRIENDS, label: 'Friends', icon: Libs.HeartHandshake },
    ],
    [],
  );

  return (
    <Molecules.FilterRadioGroup
      title="Reach"
      items={items}
      selectedValue={selectedTab}
      defaultValue={defaultSelectedTab}
      onChange={onTabChange}
      testId="filter-reach-radiogroup"
    />
  );
}
