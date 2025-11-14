'use client';

import * as React from 'react';
import * as Libs from '@/libs';
import { ProfilePageType, PROFILE_PAGE_TYPES } from '@/app/profile/types';

export interface ProfileMenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  pageType: ProfilePageType;
}

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { icon: Libs.CircleUserRound, label: 'Profile', pageType: PROFILE_PAGE_TYPES.PROFILE },
  { icon: Libs.Bell, label: 'Notifications', pageType: PROFILE_PAGE_TYPES.NOTIFICATIONS },
  { icon: Libs.MessageCircle, label: 'Replies', pageType: PROFILE_PAGE_TYPES.REPLIES },
  { icon: Libs.StickyNote, label: 'Posts', pageType: PROFILE_PAGE_TYPES.POSTS },
  { icon: Libs.UsersRound, label: 'Followers', pageType: PROFILE_PAGE_TYPES.FOLLOWERS },
  { icon: Libs.UsersRound2, label: 'Following', pageType: PROFILE_PAGE_TYPES.FOLLOWING },
  { icon: Libs.HeartHandshake, label: 'Friends', pageType: PROFILE_PAGE_TYPES.FRIENDS },
  { icon: Libs.Tag, label: 'Tagged', pageType: PROFILE_PAGE_TYPES.TAGGED },
];

export interface ProfilePageMobileMenuProps {
  activePage: ProfilePageType;
  onPageChangeAction: (page: ProfilePageType) => void;
}

export function ProfilePageMobileMenu({ activePage, onPageChangeAction }: ProfilePageMobileMenuProps) {
  return (
    <div className="sticky top-20 z-30 bg-background lg:hidden">
      <div className="flex w-full">
        {PROFILE_MENU_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isSelected = item.pageType === activePage;

          return (
            <div
              key={index}
              className={Libs.cn(
                'flex flex-1 justify-center border-b px-0 py-1.5',
                isSelected ? 'border-foreground' : 'border-border',
              )}
            >
              <button
                onClick={() => onPageChangeAction(item.pageType)}
                className={Libs.cn('px-2.5 py-2')}
                aria-label={item.label}
                aria-current={isSelected ? 'page' : undefined}
              >
                <Icon size={20} className={isSelected ? 'text-foreground' : 'text-muted-foreground'} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
