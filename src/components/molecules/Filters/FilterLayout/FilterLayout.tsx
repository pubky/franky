'use client';

import * as React from 'react';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Molecules from '@/molecules';

export function FilterLayout({
  selectedTab,
  defaultSelectedTab = Core.LAYOUT.COLUMNS,
  onTabChange,
}: Molecules.BaseFilterProps<Core.LayoutType>) {
  const items = React.useMemo(
    () => [
      { key: Core.LAYOUT.COLUMNS, label: 'Columns', icon: Libs.Columns3 },
      { key: Core.LAYOUT.WIDE, label: 'Wide', icon: Libs.Menu },
      { key: Core.LAYOUT.VISUAL, label: 'Visual', icon: Libs.LayoutGrid, disabled: true },
    ],
    [],
  );

  return (
    <Molecules.FilterRadioGroup
      title="Layout"
      items={items}
      selectedValue={selectedTab}
      defaultValue={defaultSelectedTab}
      onChange={onTabChange}
    />
  );
}
