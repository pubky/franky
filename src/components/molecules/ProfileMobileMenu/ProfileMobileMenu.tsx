'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Libs from '@/libs';
import { PROFILE_MENU_ITEMS } from '@/molecules/ProfileMenu/profileMenu.shared';

export interface ProfileMobileMenuProps {
  className?: string;
  notificationsCount?: number;
}

export function ProfileMobileMenu({ className, notificationsCount }: ProfileMobileMenuProps) {
  const pathname = usePathname();

  const isSelected = (path: string) => pathname === path;

  return (
    <div
      className={Libs.cn(
        'w-full overflow-x-auto fixed top-14 left-0 right-0 z-20 bg-background shadow-xl border-b border-border',
        className,
      )}
    >
      <div className="flex w-full items-center">
        {/* Menu items */}
        {PROFILE_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = isSelected(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={Libs.cn(
                'flex flex-1 justify-center items-center gap-2 px-0 py-1.5 transition-all relative border-b',
                selected
                  ? 'text-foreground border-b border-white'
                  : 'text-muted-foreground border-b border-transparent',
              )}
              aria-label={item.label}
              aria-current={selected ? 'page' : undefined}
            >
              <div className="flex items-center justify-center gap-2 px-2.5 py-2 rounded-md">
                <Icon size={20} className="shrink-0" />
                {item.label === 'Notifications' && notificationsCount !== undefined && (
                  <span className="text-sm font-medium leading-normal">{notificationsCount}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
