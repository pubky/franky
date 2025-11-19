'use client';

import * as React from 'react';
import * as Atoms from '@/components/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Types from '@/app/profile/types';

export interface ProfilePageFilterBarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number | undefined;
  pageType: Types.FilterBarPageType;
}

export interface ProfilePageFilterBarProps {
  items?: ProfilePageFilterBarItem[];
  stats?: Hooks.ProfileStats;
  activePage: Types.FilterBarPageType;
  onPageChangeAction: (page: Types.FilterBarPageType) => void;
}

// Item configuration - single source of truth for filter items
const FILTER_ITEMS_CONFIG: Array<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  pageType: Types.FilterBarPageType;
  statKey: keyof Hooks.ProfileStats;
}> = [
  {
    icon: Libs.Bell,
    label: 'Notifications',
    pageType: Types.PROFILE_PAGE_TYPES.NOTIFICATIONS,
    statKey: 'notifications',
  },
  {
    icon: Libs.StickyNote,
    label: 'Posts',
    pageType: Types.PROFILE_PAGE_TYPES.POSTS,
    statKey: 'posts',
  },
  {
    icon: Libs.MessageCircle,
    label: 'Replies',
    pageType: Types.PROFILE_PAGE_TYPES.REPLIES,
    statKey: 'replies',
  },
  {
    icon: Libs.UsersRound,
    label: 'Followers',
    pageType: Types.PROFILE_PAGE_TYPES.FOLLOWERS,
    statKey: 'followers',
  },
  {
    icon: Libs.UsersRound2,
    label: 'Following',
    pageType: Types.PROFILE_PAGE_TYPES.FOLLOWING,
    statKey: 'following',
  },
  {
    icon: Libs.HeartHandshake,
    label: 'Friends',
    pageType: Types.PROFILE_PAGE_TYPES.FRIENDS,
    statKey: 'friends',
  },
  {
    icon: Libs.Tag,
    label: 'Tagged',
    pageType: Types.PROFILE_PAGE_TYPES.TAGGED,
    statKey: 'tagged',
  },
];

export const getDefaultItems = (stats?: Hooks.ProfileStats): ProfilePageFilterBarItem[] => {
  return FILTER_ITEMS_CONFIG.map((config) => ({
    icon: config.icon,
    label: config.label,
    pageType: config.pageType,
    // If stats not provided, count is undefined (loading state)
    // If stats provided, use the value or fallback to 0
    count: stats ? (stats[config.statKey] ?? 0) : undefined,
  }));
};

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
          const isLoading = item.count === undefined;

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
              {isLoading ? (
                <Atoms.Spinner size="sm" className="size-4" />
              ) : (
                <Atoms.Typography
                  as="span"
                  className={`text-base font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {item.count}
                </Atoms.Typography>
              )}
            </Atoms.FilterItem>
          );
        })}
      </Atoms.Container>
    </Atoms.Container>
  );
}
