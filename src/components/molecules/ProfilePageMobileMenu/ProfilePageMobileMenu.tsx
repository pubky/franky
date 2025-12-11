'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { PROFILE_MENU_ITEMS } from './ProfilePageMobileMenu.constants';
import type { ProfilePageMobileMenuProps } from './ProfilePageMobileMenu.types';

export { PROFILE_MENU_ITEMS } from './ProfilePageMobileMenu.constants';
export type { ProfileMenuItem, ProfilePageMobileMenuProps } from './ProfilePageMobileMenu.types';

export function ProfilePageMobileMenu({
  activePage,
  onPageChangeAction,
  isOwnProfile = true,
}: ProfilePageMobileMenuProps): React.ReactElement {
  // Filter menu items based on isOwnProfile
  const visibleItems = React.useMemo(() => {
    return PROFILE_MENU_ITEMS.filter((item) => {
      if (item.ownProfileOnly && !isOwnProfile) {
        return false;
      }
      return true;
    });
  }, [isOwnProfile]);

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-(--header-height-mobile) z-(--z-mobile-menu) bg-background lg:hidden"
      data-testid="profile-page-mobile-menu"
    >
      <Atoms.Container overrideDefaults={true} className="flex w-full" data-testid="profile-page-mobile-menu-items">
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const isSelected = item.pageType === activePage;

          return (
            <Atoms.Container
              key={index}
              overrideDefaults={true}
              className={Libs.cn(
                'flex flex-1 justify-center border-b px-0 py-1.5',
                'data-testid="profile-page-mobile-menu-item"',
                isSelected ? 'border-foreground' : 'border-border',
              )}
            >
              <Atoms.Button
                overrideDefaults
                onClick={() => onPageChangeAction(item.pageType)}
                className="px-2.5 py-2"
                aria-label={item.label}
                aria-current={isSelected ? 'page' : undefined}
              >
                <Icon size={20} className={isSelected ? 'text-foreground' : 'text-muted-foreground'} />
              </Atoms.Button>
            </Atoms.Container>
          );
        })}
      </Atoms.Container>
    </Atoms.Container>
  );
}
