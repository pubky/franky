'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export type LayoutTab = 'columns' | 'wide' | 'visual';

interface LayoutProps {
  selectedTab?: LayoutTab;
  onTabChange?: (tab: LayoutTab) => void;
}

const tabs: { key: LayoutTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'columns', label: 'Columns', icon: Libs.Columns3 },
  { key: 'wide', label: 'Wide', icon: Libs.Menu },
  { key: 'visual', label: 'Visual', icon: Libs.LayoutGrid },
];

export function FilterLayout({ selectedTab = 'columns', onTabChange }: LayoutProps) {
  const handleTabClick = (tab: LayoutTab) => {
    onTabChange?.(tab);
  };

  return (
    <Atoms.FilterRoot>
      <Atoms.FilterHeader title="Layout" />

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
