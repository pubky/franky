'use client';

import { useState } from 'react';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Types from './ContentLayout.types';

/**
 * Reusable sticky sidebar component for left and right sidebars
 */
function StickySidebar({ children }: Types.StickySidebarProps) {
  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn(
        'hidden lg:flex flex-col gap-6 justify-start items-start sticky self-start',
        'top-[147px]', // 144px + 3px for the header
        'max-w-[180px] w-full',
      )}
    >
      {children}
    </Atoms.Container>
  );
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
}: Types.ContentLayoutProps) {
  const { layout } = Core.useHomeStore();
  const [drawerFilterOpen, setDrawerFilterOpen] = useState(false);
  const [drawerRightOpen, setDrawerRightOpen] = useState(false);
  const isMobile = Hooks.useIsMobile();

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
      <Atoms.Container
        overrideDefaults
        className={Libs.cn(
          'max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl',
          'w-full pb-12 m-auto px-6 xl:px-0',
          'pt-20 lg:pt-0', // Add top padding on mobile for fixed header
          className,
        )}
      >
        <Atoms.Container overrideDefaults className="flex gap-6">
          {/* Left sidebar - hidden on mobile (< lg) and in wide layout mode */}
          {showLeftSidebar && layout !== Core.LAYOUT.WIDE && leftSidebarContent && (
            <StickySidebar>{leftSidebarContent}</StickySidebar>
          )}

          {/* Main content area - grows to fill space */}
          <Atoms.Container className="gap-6 flex-1 w-full">{children}</Atoms.Container>

          {/* Right sidebar - hidden on mobile (< lg) and in wide layout mode */}
          {showRightSidebar && layout !== Core.LAYOUT.WIDE && rightSidebarContent && (
            <StickySidebar>{rightSidebarContent}</StickySidebar>
          )}
        </Atoms.Container>
      </Atoms.Container>

      {/* Mobile footer navigation */}
      <Molecules.MobileFooter />

      {/* Drawer for left sidebar - slides in from left */}
      {(leftDrawerContent || leftDrawerContentMobile) && (
        <Molecules.SideDrawer open={drawerFilterOpen} onOpenChangeAction={setDrawerFilterOpen} position="left">
          {isMobile && leftDrawerContentMobile ? leftDrawerContentMobile : leftDrawerContent}
        </Molecules.SideDrawer>
      )}

      {/* Drawer for right sidebar - slides in from right */}
      {(rightDrawerContent || rightDrawerContentMobile) && (
        <Molecules.SideDrawer open={drawerRightOpen} onOpenChangeAction={setDrawerRightOpen} position="right">
          {isMobile && rightDrawerContentMobile ? rightDrawerContentMobile : rightDrawerContent}
        </Molecules.SideDrawer>
      )}
    </>
  );
}
