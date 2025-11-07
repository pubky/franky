'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Libs from '@/libs';
import { PROFILE_MENU_ITEMS, getProfileCount, ProfileCounts } from '@/molecules/ProfileMenu/profileMenu.shared';
import { PROFILE_ROUTES } from '@/app';

export interface ProfileMobileMenuProps {
  className?: string;
  counts?: ProfileCounts;
}

export function ProfileMobileMenu({ className, counts }: ProfileMobileMenuProps) {
  const pathname = usePathname();

  const getCount = (label: string) => getProfileCount(label, counts);

  const isSelected = (path: string) => pathname === path;

  // Reorder menu items for mobile: Tagged first, then others
  const taggedItem = PROFILE_MENU_ITEMS.find((item) => item.path === PROFILE_ROUTES.TAGGED);
  const otherItems = PROFILE_MENU_ITEMS.filter((item) => item.path !== PROFILE_ROUTES.TAGGED);
  const mobileMenuItems = taggedItem ? [taggedItem, ...otherItems] : PROFILE_MENU_ITEMS;

  return (
    <div
      className={Libs.cn(
        'w-full overflow-x-auto fixed top-18 left-0 right-0 z-20 bg-background shadow-xl border-b border-border',
        className,
      )}
    >
      <div className="flex w-full items-center">
        {/* Menu items - Tagged is first on mobile with CircleUserRound icon */}
        {mobileMenuItems.map((item) => {
          // Use CircleUserRound icon for Tagged on mobile, otherwise use the item's icon
          const Icon = item.path === PROFILE_ROUTES.TAGGED ? Libs.CircleUserRound : item.icon;
          const selected = isSelected(item.path);
          const count = getCount(item.label);

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
                {count !== undefined && <span className="text-sm font-medium leading-normal">{count}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
