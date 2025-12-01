'use client';

import * as Molecules from '@/molecules';
import * as Core from '@/core';

/**
 * HomeFeedSidebar
 *
 * Left sidebar for Home feed - manages filter state via Core.useHomeStore.
 * Desktop version with sticky positioning.
 */
export function HomeFeedSidebar() {
  const { layout, setLayout, reach, setReach, sort, setSort, content, setContent } = Core.useHomeStore();

  return (
    <>
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
      <div className="sticky top-[100px] flex w-full flex-col gap-6 self-start">
        <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
        <Molecules.FilterLayout selectedTab={layout} onTabChange={setLayout} />
      </div>
    </>
  );
}

/**
 * HomeFeedDrawer
 *
 * Left drawer for Home feed (tablet) - manages filter state via Core.useHomeStore.
 */
export function HomeFeedDrawer() {
  const { layout, setLayout, reach, setReach, sort, setSort, content, setContent } = Core.useHomeStore();

  return (
    <div className="flex flex-col gap-6">
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
      <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
      <Molecules.FilterLayout selectedTab={layout} onTabChange={setLayout} />
    </div>
  );
}

/**
 * HomeFeedDrawerMobile
 *
 * Left drawer for Home feed (mobile) - manages filter state via Core.useHomeStore.
 * Note: Mobile version doesn't show layout filter.
 */
export function HomeFeedDrawerMobile() {
  const { reach, setReach, sort, setSort, content, setContent } = Core.useHomeStore();

  return (
    <div className="flex flex-col gap-6">
      <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
      <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
      <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
    </div>
  );
}
