'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import type { HomeFeedSidebarProps } from './HomeFeedSidebar.types';

/**
 * HomeFeedFilters
 *
 * Base component for Home feed filters - manages filter state via Core.useHomeStore.
 * Used by sidebar (desktop) and drawer (tablet/mobile) variants.
 *
 * Order follows Figma design: Reach → Sort → Layout → Content
 * Gap between sections: 24px (gap-6)
 */
function HomeFeedFilters({
  hideReachFilter = false,
  hideLayoutFilter = false,
  variant = 'drawer',
}: HomeFeedSidebarProps) {
  const { layout, setLayout, reach, setReach, sort, setSort, content, setContent } = Core.useHomeStore();

  return (
    <Atoms.Container overrideDefaults className="flex flex-col gap-6">
      {!hideReachFilter && <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />}
      <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
      {variant === 'sidebar' ? (
        <Atoms.Container overrideDefaults className="sticky top-[100px] flex w-full flex-col gap-6 self-start">
          {!hideLayoutFilter && <Molecules.FilterLayout selectedTab={layout} onTabChange={setLayout} />}
          <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
        </Atoms.Container>
      ) : (
        <>
          {!hideLayoutFilter && <Molecules.FilterLayout selectedTab={layout} onTabChange={setLayout} />}
          <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
        </>
      )}
    </Atoms.Container>
  );
}

/**
 * HomeFeedSidebar
 *
 * Left sidebar for Home feed (desktop) - manages filter state via Core.useHomeStore.
 * Desktop version with sticky positioning.
 */
export function HomeFeedSidebar({ hideReachFilter = false }: HomeFeedSidebarProps) {
  return <HomeFeedFilters hideReachFilter={hideReachFilter} variant="sidebar" />;
}

/**
 * HomeFeedDrawer
 *
 * Left drawer for Home feed (tablet) - manages filter state via Core.useHomeStore.
 */
export function HomeFeedDrawer({ hideReachFilter = false }: HomeFeedSidebarProps) {
  return <HomeFeedFilters hideReachFilter={hideReachFilter} variant="drawer" />;
}

/**
 * HomeFeedDrawerMobile
 *
 * Left drawer for Home feed (mobile) - manages filter state via Core.useHomeStore.
 * Note: Mobile version doesn't show layout filter.
 */
export function HomeFeedDrawerMobile({ hideReachFilter = false }: HomeFeedSidebarProps) {
  return <HomeFeedFilters hideReachFilter={hideReachFilter} hideLayoutFilter variant="drawer" />;
}
