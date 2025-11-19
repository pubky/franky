'use client';

import * as React from 'react';
import * as Atoms from '@/components/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Types from '@/app/profile/types';

export interface ProfilePageFilterBarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  pageType: Types.FilterBarPageType;
}

export interface ProfilePageFilterBarProps {
  items?: ProfilePageFilterBarItem[];
  stats?: Hooks.ProfileStats;
  activePage: Types.FilterBarPageType;
  onPageChangeAction: (page: Types.FilterBarPageType) => void;
}

export const getDefaultItems = (stats?: Hooks.ProfileStats): ProfilePageFilterBarItem[] => [
  {
    icon: Libs.Bell,
    label: 'Notifications',
    count: stats?.notifications ?? 0,
    pageType: Types.PROFILE_PAGE_TYPES.NOTIFICATIONS,
  },
  {
    icon: Libs.StickyNote,
    label: 'Posts',
    count: stats?.posts ?? 0,
    pageType: Types.PROFILE_PAGE_TYPES.POSTS,
  },
  {
    icon: Libs.MessageCircle,
    label: 'Replies',
    count: stats?.replies ?? 0,
    pageType: Types.PROFILE_PAGE_TYPES.REPLIES,
  },
  {
    icon: Libs.UsersRound,
    label: 'Followers',
    count: stats?.followers ?? 0,
    pageType: Types.PROFILE_PAGE_TYPES.FOLLOWERS,
  },
  {
    icon: Libs.UsersRound2,
    label: 'Following',
    count: stats?.following ?? 0,
    pageType: Types.PROFILE_PAGE_TYPES.FOLLOWING,
  },
  {
    icon: Libs.HeartHandshake,
    label: 'Friends',
    count: stats?.friends ?? 0,
    pageType: Types.PROFILE_PAGE_TYPES.FRIENDS,
  },
  {
    icon: Libs.Tag,
    label: 'Tagged',
    count: stats?.tagged ?? 0,
    pageType: Types.PROFILE_PAGE_TYPES.TAGGED,
  },
];

export function ProfilePageFilterBar({ items, stats, activePage, onPageChangeAction }: ProfilePageFilterBarProps) {
  // Use provided items or generate default items with stats
  const filterItems = items ?? getDefaultItems(stats);

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-(--header-height) hidden h-fit w-(--filter-bar-width) flex-col self-start lg:flex"
    >
      <Atoms.Container overrideDefaults={true} className="flex flex-col gap-0">
        {filterItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.pageType === activePage;

          return (
            <Atoms.FilterItem
              key={index}
              isSelected={isActive}
              onClick={() => onPageChangeAction(item.pageType)}
              className="w-full items-start justify-between px-0 py-1"
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
