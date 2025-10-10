'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';

export interface ProfileMenuTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number | null;
}

export interface ProfileMenuProps {
  tabs: ProfileMenuTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function ProfileMenu({ tabs, activeTab, onTabChange, className }: ProfileMenuProps) {
  return (
    <Atoms.FilterRoot className={className}>
      <Atoms.FilterHeader title="Profile" />
      <Atoms.FilterList>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <Atoms.FilterItem
              key={tab.id}
              isSelected={isSelected}
              onClick={() => onTabChange(tab.id)}
              data-testid={`profile-tab-${tab.id}`}
            >
              <Atoms.FilterItemIcon icon={tab.icon} />
              <Atoms.FilterItemLabel>{tab.label}</Atoms.FilterItemLabel>
              {tab.count !== undefined && tab.count !== null && (
                <Atoms.Typography size="sm" className="ml-auto text-muted-foreground">
                  {tab.count}
                </Atoms.Typography>
              )}
            </Atoms.FilterItem>
          );
        })}
      </Atoms.FilterList>
    </Atoms.FilterRoot>
  );
}
