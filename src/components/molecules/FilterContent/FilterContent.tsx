'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { CONTENT, type ContentType } from '@/core/stores/home/home.types';

export type ContentTab = ContentType;

interface ContentProps {
  selectedTab?: ContentTab;
  onTabChange?: (tab: ContentTab) => void;
}

const tabs: { key: ContentTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: CONTENT.ALL, label: 'All', icon: Libs.Layers },
  { key: CONTENT.SHORT, label: 'Posts', icon: Libs.StickyNote },
  { key: CONTENT.LONG, label: 'Articles', icon: Libs.Newspaper },
  { key: CONTENT.IMAGES, label: 'Images', icon: Libs.Image },
  { key: CONTENT.VIDEOS, label: 'Videos', icon: Libs.CirclePlay },
  { key: CONTENT.LINKS, label: 'Links', icon: Libs.Link },
  { key: CONTENT.FILES, label: 'Files', icon: Libs.Download },
];

export function FilterContent({ selectedTab = CONTENT.ALL, onTabChange }: ContentProps) {
  const handleTabClick = (tab: ContentTab) => {
    onTabChange?.(tab);
  };

  return (
    <Atoms.FilterRoot>
      <Atoms.FilterHeader title="Content" />

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
