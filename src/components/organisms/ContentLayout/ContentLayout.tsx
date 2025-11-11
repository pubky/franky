'use client';

import { useState, useEffect } from 'react';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import * as Libs from '@/libs';

export interface ContentLayoutProps {
  children: React.ReactNode;
  leftSidebarContent?: React.ReactNode;
  rightSidebarContent?: React.ReactNode;
  leftDrawerContent?: React.ReactNode;
  rightDrawerContent?: React.ReactNode;
  leftDrawerContentMobile?: React.ReactNode;
  rightDrawerContentMobile?: React.ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  showLeftMobileButton?: boolean;
  showRightMobileButton?: boolean;
  className?: string;
}

export function ContentLayout({
  children,
  leftSidebarContent,
  rightSidebarContent,
  leftDrawerContent,
  rightDrawerContent,
  leftDrawerContentMobile,
  rightDrawerContentMobile,
  showLeftSidebar = true,
  showRightSidebar = true,
  showLeftMobileButton = true,
  showRightMobileButton = true,
  className,
}: ContentLayoutProps) {
  const { layout } = Core.useHomeStore();
  const [drawerFilterOpen, setDrawerFilterOpen] = useState(false);
  const [drawerRightOpen, setDrawerRightOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport and close drawers when switching to desktop view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Close drawers when viewport is >= lg breakpoint (1024px)
      if (!mobile) {
        setDrawerFilterOpen(false);
        setDrawerRightOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close drawers when switching from wide to column layout
  useEffect(() => {
    if (layout !== Core.LAYOUT.WIDE) {
      setDrawerFilterOpen(false);
      setDrawerRightOpen(false);
    }
  }, [layout]);

  return (
    <>
      {/* Mobile header with drawer icons - hidden on desktop */}
      <Molecules.MobileHeader
        onLeftIconClick={showLeftMobileButton ? () => setDrawerFilterOpen(true) : undefined}
        onRightIconClick={showRightMobileButton ? () => setDrawerRightOpen(true) : undefined}
        showLeftButton={showLeftMobileButton}
        showRightButton={showRightMobileButton}
      />

      {/* Buttons to open drawers - visible on desktop when in wide layout */}
      {layout === Core.LAYOUT.WIDE && showLeftSidebar && leftDrawerContent && (
        <Molecules.ButtonFilters onClick={() => setDrawerFilterOpen(true)} position="left" />
      )}
      {layout === Core.LAYOUT.WIDE && showRightSidebar && rightDrawerContent && (
        <Molecules.ButtonFilters onClick={() => setDrawerRightOpen(true)} position="right" />
      )}

      {/* Main content grid with responsive max-widths */}
      <div
        className={Libs.cn(
          'max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl',
          'w-full pb-12 m-auto px-6 xl:px-0',
          'pt-20 lg:pt-0', // Add top padding on mobile for fixed header
          className,
        )}
      >
        <div className="flex gap-6">
          {/* Left sidebar - hidden on mobile (< lg) and in wide layout mode */}
          {showLeftSidebar && layout !== Core.LAYOUT.WIDE && leftSidebarContent && (
            <div
              className={Libs.cn(
                'w-[180px] hidden lg:flex flex-col gap-6 justify-start items-start sticky top-[144px] self-start h-fit',
              )}
            >
              {leftSidebarContent}
            </div>
          )}

          {/* Main content area - grows to fill space */}
          <div className="flex-1 flex flex-col gap-6">{children}</div>

          {/* Right sidebar - hidden on mobile (< lg) and in wide layout mode */}
          {showRightSidebar && layout !== Core.LAYOUT.WIDE && rightSidebarContent && (
            <div
              className={Libs.cn(
                'w-[180px] hidden lg:flex flex-col gap-6 justify-start items-start sticky top-[144px] self-start max-h-[calc(100vh-168px)] overflow-y-auto',
              )}
            >
              {rightSidebarContent}
            </div>
          )}
        </div>
      </div>

      {/* Mobile footer navigation */}
      <Molecules.MobileFooter />

      {/* Drawer for filters - slides in from left */}
      {(leftDrawerContent || leftDrawerContentMobile) && (
        <Molecules.FilterDrawer open={drawerFilterOpen} onOpenChangeAction={setDrawerFilterOpen} position="left">
          {isMobile && leftDrawerContentMobile ? leftDrawerContentMobile : leftDrawerContent}
        </Molecules.FilterDrawer>
      )}

      {/* Drawer for right sidebar - slides in from right */}
      {(rightDrawerContent || rightDrawerContentMobile) && (
        <Molecules.FilterDrawer open={drawerRightOpen} onOpenChangeAction={setDrawerRightOpen} position="right">
          {isMobile && rightDrawerContentMobile ? rightDrawerContentMobile : rightDrawerContent}
        </Molecules.FilterDrawer>
      )}
    </>
  );
}
