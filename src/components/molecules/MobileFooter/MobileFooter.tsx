'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as App from '@/app';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

export interface MobileFooterProps {
  className?: string;
}

export function MobileFooter({ className }: MobileFooterProps) {
  const pathname = usePathname();
  const { userDetails, currentUserPubky } = Hooks.useCurrentUserProfile();

  const isActive = (path: string) => pathname === path;

  // Get avatar URL and fallback initial - same logic as desktop header
  const avatarUrl = currentUserPubky ? Core.FileController.getAvatarUrl(currentUserPubky) : undefined;
  const avatarInitial = Libs.extractInitials({ name: userDetails?.name || '' }) || 'U';

  const navItems = [
    { href: App.APP_ROUTES.HOME, icon: Libs.Home, label: 'Home' },
    { href: App.APP_ROUTES.SEARCH, icon: Libs.Search, label: 'Search' },
    { href: App.APP_ROUTES.HOT, icon: Libs.Flame, label: 'Hot' },
    { href: App.APP_ROUTES.BOOKMARKS, icon: Libs.Bookmark, label: 'Bookmarks' },
    { href: App.APP_ROUTES.SETTINGS, icon: Libs.Settings, label: 'Settings' },
  ];

  return (
    <div className={Libs.cn('flex justify-center pb-20 lg:hidden', className)}>
      <div className="fixed bottom-0 z-40 flex w-full max-w-[380px] items-center justify-between overflow-x-auto bg-gradient-to-t from-background via-background/95 to-transparent px-3 py-4 sm:max-w-[600px] md:max-w-[720px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={Libs.cn(
                'rounded-full p-3 backdrop-blur-sm transition-all',
                isActive(item.href) ? 'bg-secondary/30' : 'bg-secondary/20 hover:bg-secondary/25',
              )}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
        <Link
          id="footer-nav-profile-btn"
          href={App.APP_ROUTES.PROFILE}
          aria-label="Profile"
          className="relative flex-shrink-0"
        >
          <Atoms.Avatar className={Libs.cn('h-12 w-12', isActive(App.APP_ROUTES.PROFILE) ? 'ring-2 ring-primary' : '')}>
            <Atoms.AvatarImage src={avatarUrl} alt="Profile" />
            <Atoms.AvatarFallback>{avatarInitial}</Atoms.AvatarFallback>
          </Atoms.Avatar>
        </Link>
      </div>
    </div>
  );
}
