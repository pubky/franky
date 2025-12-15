'use client';

import * as React from 'react';
import * as Atoms from '@/components/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Types from '@/app/profile/types';
import * as Config from '@/config';

export interface ProfilePageFilterBarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number | undefined;
  pageType: Types.FilterBarPageType;
  /** Whether this item should only be shown for own profile */
  ownProfileOnly?: boolean;
}

export interface ProfilePageFilterBarProps {
  items?: ProfilePageFilterBarItem[];
  stats?: Hooks.ProfileStats;
  activePage: Types.FilterBarPageType;
  onPageChangeAction: (page: Types.FilterBarPageType) => void;
  /** Whether this is the logged-in user's own profile */
  isOwnProfile?: boolean;
}

// Item configuration - single source of truth for filter items
const FILTER_ITEMS_CONFIG: Array<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  pageType: Types.FilterBarPageType;
  statKey: keyof Hooks.ProfileStats;
  /** Whether this item should only be shown for own profile */
  ownProfileOnly?: boolean;
}> = [
  {
    icon: Libs.Bell,
    label: 'Notifications',
    pageType: Types.PROFILE_PAGE_TYPES.NOTIFICATIONS,
    statKey: 'notifications',
    ownProfileOnly: true, // Notifications only make sense for logged-in user
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
    pageType: Types.PROFILE_PAGE_TYPES.UNIQUE_TAGS,
    statKey: 'uniqueTags',
  },
];

export const getDefaultItems = (
  stats?: Hooks.ProfileStats,
  isOwnProfile: boolean = true,
): ProfilePageFilterBarItem[] => {
  return FILTER_ITEMS_CONFIG.filter((config) => {
    // Filter out own-profile-only items when viewing another user's profile
    if (config.ownProfileOnly && !isOwnProfile) {
      return false;
    }
    return true;
  }).map((config) => ({
    icon: config.icon,
    label: config.label,
    pageType: config.pageType,
    // If stats not provided, count is undefined (loading state)
    // If stats provided, use the value or fallback to 0
    count: stats ? (stats[config.statKey] ?? 0) : undefined,
    ownProfileOnly: config.ownProfileOnly,
  }));
};

export function ProfilePageFilterBar({
  items,
  stats,
  activePage,
  onPageChangeAction,
  isOwnProfile = true,
}: ProfilePageFilterBarProps) {
  // Use provided items or generate default items with stats
  const filterItems = React.useMemo(() => {
    if (items) {
      // Filter provided items based on isOwnProfile
      return items.filter((item) => {
        if (item.ownProfileOnly && !isOwnProfile) {
          return false;
        }
        return true;
      });
    }
    return getDefaultItems(stats, isOwnProfile);
  }, [items, stats, isOwnProfile]);

  // Only apply sticky when content fits in viewport
  const { ref, shouldBeSticky } = Hooks.useStickyWhenFits({
    topOffset: Config.LAYOUT.HEADER_HEIGHT_PROFILE,
    bottomOffset: Config.LAYOUT.SIDEBAR_BOTTOM_OFFSET,
  });

  return (
    <Atoms.Container
      ref={ref}
      overrideDefaults={true}
      className={Libs.cn(
        'hidden h-fit w-(--filter-bar-width) flex-col self-start lg:flex',
        shouldBeSticky && 'sticky top-(--header-height)',
      )}
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
              <Atoms.Container
                data-cy={`profile-filter-item-${item.label.toLowerCase()}`}
                overrideDefaults={true}
                className="flex items-center gap-2"
              >
                <Atoms.FilterItemIcon icon={Icon} />
                <Atoms.FilterItemLabel>{item.label}</Atoms.FilterItemLabel>
              </Atoms.Container>
              {isLoading ? (
                <Atoms.Spinner size="sm" className="size-4" />
              ) : (
                <Atoms.Typography
                  data-cy={`profile-filter-item-${item.label.toLowerCase()}-count`}
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
