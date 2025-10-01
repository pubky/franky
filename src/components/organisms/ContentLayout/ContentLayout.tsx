'use client';

import { useState } from 'react';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Libs from '@/libs';

export interface ContentLayoutProps {
  children: React.ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  className?: string;
}

export function ContentLayout({
  children,
  showLeftSidebar = true,
  showRightSidebar = true,
  className,
}: ContentLayoutProps) {
  const { layout, setLayout, reach, setReach, sort, setSort, content, setContent } = Core.useFiltersStore();
  const [drawerFilterOpen, setDrawerFilterOpen] = useState(false);
  const [drawerRightOpen, setDrawerRightOpen] = useState(false);

  return (
    <>
      {/* Mobile header with drawer icons */}
      <Molecules.MobileHeader onLeftIconClick={() => setDrawerFilterOpen(true)} />

      {/* Buttons to open drawers - visible on desktop when in wide layout */}
      {layout === Core.LAYOUT.WIDE && showLeftSidebar && (
        <Molecules.ButtonFilters onClick={() => setDrawerFilterOpen(true)} position="left" />
      )}
      {layout === Core.LAYOUT.WIDE && showRightSidebar && (
        <Molecules.ButtonFilters onClick={() => setDrawerRightOpen(true)} position="right" />
      )}

      {/* Main content grid with responsive max-widths */}
      <div
        className={Libs.cn(
          'max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl',
          'w-full pb-12 m-auto px-3',
          'pt-16 lg:pt-0', // Add top padding on mobile for fixed header
          className,
        )}
      >
        <div className="flex gap-6">
          {/* Left sidebar - hidden on mobile (< lg) and in wide layout */}
          {showLeftSidebar && layout !== Core.LAYOUT.WIDE && <Organisms.LeftSidebar />}

          {/* Main content area - grows to fill space */}
          <div className="flex-1 flex flex-col gap-6">{children}</div>

          {/* Right sidebar - hidden on mobile (< lg) and in wide layout */}
          {showRightSidebar && layout !== Core.LAYOUT.WIDE && <Organisms.RightSidebar />}
        </div>
      </div>

      {/* Mobile footer navigation */}
      <Molecules.MobileFooter />

      {/* Drawer for filters - slides in from left */}
      <Molecules.FilterDrawer open={drawerFilterOpen} onOpenChangeAction={setDrawerFilterOpen} position="left">
        <div className="flex flex-col gap-6">
          <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
          <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
          <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
          <Molecules.FilterLayout
            selectedTab={layout}
            onTabChange={setLayout}
            onClose={() => setDrawerFilterOpen(false)}
          />
        </div>
      </Molecules.FilterDrawer>

      {/* Drawer for right sidebar - slides in from right */}
      <Molecules.FilterDrawer open={drawerRightOpen} onOpenChangeAction={setDrawerRightOpen} position="right">
        <div className="flex flex-col gap-6">
          <Molecules.WhoToFollow />
          <Molecules.ActiveUsers />
          <Molecules.FeedbackCard />
        </div>
      </Molecules.FilterDrawer>
    </>
  );
}
