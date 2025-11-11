'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { REACH, type ReachType } from '@/core/stores/home/home.types';

export type ReachTab = ReachType;

interface ReachProps {
  selectedTab?: ReachTab;
  onTabChange?: (tab: ReachTab) => void;
}

const tabs: { key: ReachTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: REACH.ALL, label: 'All', icon: Libs.Radio },
  { key: REACH.FOLLOWING, label: 'Following', icon: Libs.UsersRound2 },
  { key: REACH.FRIENDS, label: 'Friends', icon: Libs.HeartHandshake },
  // { key: REACH.ME, label: 'Me', icon: Libs.UserRound },
];

export function FilterReach({ selectedTab = REACH.ALL, onTabChange }: ReachProps) {
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
