'use client';

import * as React from 'react';
import * as Atoms from '@/components/atoms';
import * as Hooks from '@/hooks';
import * as Types from '@/app/profile/profile.types';
import { FILTER_ITEMS_CONFIG } from './ProfilePageFilterBar.constants';

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
}: ProfilePageFilterBarProps): React.ReactElement {
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
