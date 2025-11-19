'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Types from '@/app/profile/types';

export interface ProfileMenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  pageType: Types.ProfilePageType;
}

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { icon: Libs.CircleUserRound, label: 'Profile', pageType: Types.PROFILE_PAGE_TYPES.PROFILE },
  { icon: Libs.Bell, label: 'Notifications', pageType: Types.PROFILE_PAGE_TYPES.NOTIFICATIONS },
  { icon: Libs.MessageCircle, label: 'Replies', pageType: Types.PROFILE_PAGE_TYPES.REPLIES },
  { icon: Libs.StickyNote, label: 'Posts', pageType: Types.PROFILE_PAGE_TYPES.POSTS },
  { icon: Libs.UsersRound, label: 'Followers', pageType: Types.PROFILE_PAGE_TYPES.FOLLOWERS },
  { icon: Libs.UsersRound2, label: 'Following', pageType: Types.PROFILE_PAGE_TYPES.FOLLOWING },
  { icon: Libs.HeartHandshake, label: 'Friends', pageType: Types.PROFILE_PAGE_TYPES.FRIENDS },
  { icon: Libs.Tag, label: 'Tagged', pageType: Types.PROFILE_PAGE_TYPES.TAGGED },
];

export interface ProfilePageMobileMenuProps {
  activePage: Types.ProfilePageType;
  onPageChangeAction: (page: Types.ProfilePageType) => void;
}

export function ProfilePageMobileMenu({ activePage, onPageChangeAction }: ProfilePageMobileMenuProps) {
  return (
    <Atoms.Container
      overrideDefaults={true}
      className="sticky top-(--header-height-mobile) z-(--z-mobile-menu) bg-background lg:hidden"
      data-testid="profile-page-mobile-menu"
    >
      <Atoms.Container overrideDefaults={true} className="flex w-full" data-testid="profile-page-mobile-menu-items">
        {PROFILE_MENU_ITEMS.map((item, index) => {
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
                variant="unstyled"
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
