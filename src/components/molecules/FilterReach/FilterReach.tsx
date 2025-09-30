'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export type ReachTab = 'all' | 'following' | 'friends' | 'me';

interface ReachProps {
  selectedTab?: ReachTab;
  onTabChange?: (tab: ReachTab) => void;
}

const tabs: { key: ReachTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'all', label: 'All', icon: Libs.Radio },
  { key: 'following', label: 'Following', icon: Libs.UsersRound2 },
  { key: 'friends', label: 'Friends', icon: Libs.HeartHandshake },
  { key: 'me', label: 'Me', icon: Libs.UserRound },
];

export function FilterReach({ selectedTab = 'all', onTabChange }: ReachProps) {
  const handleTabClick = (tab: ReachTab) => {
    onTabChange?.(tab);
  };

  return (
    <Atoms.FilterRoot>
      <Atoms.FilterHeader title="Reach" />

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
