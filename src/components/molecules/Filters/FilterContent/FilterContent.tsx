'use client';

import * as React from 'react';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as Molecules from '@/molecules';

export function FilterContent({
  selectedTab,
  defaultSelectedTab = Core.CONTENT.ALL,
  onTabChange,
}: Molecules.BaseFilterProps<Core.ContentType>): React.ReactElement {
  const items = React.useMemo(
    () => [
      { key: Core.CONTENT.ALL, label: 'All', icon: Libs.Layers },
      { key: Core.CONTENT.SHORT, label: 'Posts', icon: Libs.StickyNote },
      { key: Core.CONTENT.LONG, label: 'Articles', icon: Libs.Newspaper },
      { key: Core.CONTENT.IMAGES, label: 'Images', icon: Libs.Image },
      { key: Core.CONTENT.VIDEOS, label: 'Videos', icon: Libs.CirclePlay },
      { key: Core.CONTENT.LINKS, label: 'Links', icon: Libs.Link },
      { key: Core.CONTENT.FILES, label: 'Files', icon: Libs.Download },
    ],
    [],
  );

  return (
    <Molecules.FilterRadioGroup
      title="Content"
      items={items}
      selectedValue={selectedTab}
      defaultValue={defaultSelectedTab}
      onChange={onTabChange}
    />
  );
}
