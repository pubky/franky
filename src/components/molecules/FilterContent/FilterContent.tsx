'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export type ContentTab = 'all' | 'posts' | 'articles' | 'images' | 'videos' | 'links' | 'files';

interface ContentProps {
  selectedTab?: ContentTab;
  onTabChange?: (tab: ContentTab) => void;
}

const tabs: { key: ContentTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'all', label: 'All', icon: Libs.Layers },
  { key: 'posts', label: 'Posts', icon: Libs.StickyNote },
  { key: 'articles', label: 'Articles', icon: Libs.Newspaper },
  { key: 'images', label: 'Images', icon: Libs.Image },
  { key: 'videos', label: 'Videos', icon: Libs.CirclePlay },
  { key: 'links', label: 'Links', icon: Libs.Link },
  { key: 'files', label: 'Files', icon: Libs.Download },
];

export function FilterContent({ selectedTab = 'all', onTabChange }: ContentProps) {
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
