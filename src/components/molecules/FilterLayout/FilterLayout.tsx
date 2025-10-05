'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { LAYOUT, type LayoutType } from '@/core/stores/filters/filters.types';

export type LayoutTab = LayoutType;

interface LayoutProps {
  selectedTab?: LayoutTab;
  onTabChange?: (tab: LayoutTab) => void;
  onClose?: () => void;
}

const tabs: { key: LayoutTab; label: string; icon: React.ComponentType<{ className?: string }>; disabled?: boolean }[] =
  [
    { key: LAYOUT.COLUMNS, label: 'Columns', icon: Libs.Columns3 },
    { key: LAYOUT.WIDE, label: 'Wide', icon: Libs.Menu },
    { key: LAYOUT.VISUAL, label: 'Visual', icon: Libs.LayoutGrid, disabled: true },
  ];

export function FilterLayout({ selectedTab = LAYOUT.COLUMNS, onTabChange, onClose }: LayoutProps) {
  const handleTabClick = (tab: LayoutTab) => {
    onTabChange?.(tab);
    onClose?.(); // Close dialog after selection
  };

  return (
    <Atoms.FilterRoot>
      <Atoms.FilterHeader title="Layout" />

      <Atoms.FilterList>
        {tabs.map(({ key, label, icon: Icon, disabled }) => {
          const isSelected = selectedTab === key;

          return (
            <Atoms.FilterItem
              key={key}
              isSelected={isSelected}
              onClick={disabled ? undefined : () => handleTabClick(key)}
              className={disabled ? 'opacity-20 cursor-default' : ''}
            >
              <Atoms.FilterItemIcon icon={Icon} />
              <Atoms.FilterItemLabel>{label}</Atoms.FilterItemLabel>
            </Atoms.FilterItem>
          );
        })}
      </Atoms.FilterList>
    </Atoms.FilterRoot>
  );
}
