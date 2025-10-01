'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as App from '@/app';

export interface MobileFooterProps {
  className?: string;
}

export function MobileFooter({ className }: MobileFooterProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: App.FEED_ROUTES.FEED, icon: Libs.Home, label: 'Feed' },
    { href: '/search', icon: Libs.Search, label: 'Search' },
    { href: '/bookmarks', icon: Libs.Bookmark, label: 'Bookmarks' },
    { href: '/settings', icon: Libs.Settings, label: 'Settings' },
  ];

  return (
    <div className={Libs.cn('pb-20 flex justify-center lg:hidden', className)}>
      <div className="overflow-x-auto w-full max-w-[380px] sm:max-w-[600px] md:max-w-[720px] py-4 bg-gradient-to-t from-background via-background/95 to-transparent flex items-center justify-between fixed bottom-0 z-40 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={Libs.cn(
                'p-3 rounded-full backdrop-blur-sm transition-all',
                isActive(item.href) ? 'bg-secondary/30' : 'bg-secondary/20 hover:bg-secondary/25',
              )}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
        <Link href="/profile" className="flex-shrink-0 relative">
          <Atoms.Avatar className="h-12 w-12">
            <Atoms.AvatarImage src="https://i.pravatar.cc/150?img=68" alt="Profile" />
            <Atoms.AvatarFallback>
              <Libs.User className="h-5 w-5" />
            </Atoms.AvatarFallback>
          </Atoms.Avatar>
        </Link>
      </div>
    </div>
  );
}
