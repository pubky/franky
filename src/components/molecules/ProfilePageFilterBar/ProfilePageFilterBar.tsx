'use client';

import * as React from 'react';
import * as Atoms from '@/components/atoms';
import * as Libs from '@/libs';
import { FilterBarPageType, PROFILE_PAGE_TYPES } from '@/app/profile/types';

export interface ProfilePageFilterBarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  pageType: FilterBarPageType;
}

export interface ProfilePageFilterBarProps {
  items?: ProfilePageFilterBarItem[];
  activePage: FilterBarPageType;
  onPageChangeAction: (page: FilterBarPageType) => void;
}

export const DEFAULT_ITEMS: ProfilePageFilterBarItem[] = [
  { icon: Libs.Bell, label: 'Notifications', count: 2, pageType: PROFILE_PAGE_TYPES.NOTIFICATIONS },
  { icon: Libs.StickyNote, label: 'Posts', count: 4, pageType: PROFILE_PAGE_TYPES.POSTS },
  { icon: Libs.MessageCircle, label: 'Replies', count: 7, pageType: PROFILE_PAGE_TYPES.REPLIES },
  { icon: Libs.UsersRound, label: 'Followers', count: 115, pageType: PROFILE_PAGE_TYPES.FOLLOWERS },
  { icon: Libs.UsersRound2, label: 'Following', count: 27, pageType: PROFILE_PAGE_TYPES.FOLLOWING },
  { icon: Libs.HeartHandshake, label: 'Friends', count: 10, pageType: PROFILE_PAGE_TYPES.FRIENDS },
  { icon: Libs.Tag, label: 'Tagged', count: 5, pageType: PROFILE_PAGE_TYPES.TAGGED },
];

export function ProfilePageFilterBar({
  items = DEFAULT_ITEMS,
  activePage,
  onPageChangeAction,
}: ProfilePageFilterBarProps) {
  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-[calc(var(--header-height)+var(--profile-header-height))] hidden h-fit w-[180px] flex-col self-start lg:flex"
    >
      <Atoms.Container overrideDefaults={true} className="flex flex-col gap-0">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.pageType === activePage;

          return (
            <Atoms.FilterItem
              key={index}
              isSelected={isActive}
              onClick={() => onPageChangeAction(item.pageType)}
              className="w-full justify-between px-0 py-1"
            >
              <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
                <Atoms.FilterItemIcon icon={Icon} />
                <Atoms.FilterItemLabel>{item.label}</Atoms.FilterItemLabel>
              </Atoms.Container>
              <Atoms.Typography
                as="span"
                className={`text-base font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {item.count}
              </Atoms.Typography>
            </Atoms.FilterItem>
          );
        })}
      </Atoms.Container>
    </Atoms.Container>
  );
}
