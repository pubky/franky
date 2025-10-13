'use client';

import { usePathname, useRouter } from 'next/navigation';
import * as Libs from '@/libs';
import { PROFILE_MENU_ITEMS } from '@/molecules/ProfileMenu/ProfileMenu';

export interface ProfileMobileMenuProps {
  className?: string;
  counts?: {
    posts?: number;
    replies?: number;
    tagged?: number;
    followers?: number;
    following?: number;
    friends?: number;
  };
}

export function ProfileMobileMenu({ className, counts }: ProfileMobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getCount = (label: string) => {
    if (!counts) return undefined;
    switch (label) {
      case 'Posts':
        return counts.posts;
      case 'Replies':
        return counts.replies;
      case 'Tagged':
        return counts.tagged;
      case 'Followers':
        return counts.followers;
      case 'Following':
        return counts.following;
      case 'Friends':
        return counts.friends;
      default:
        return undefined;
    }
  };

  return (
    <div
      className={Libs.cn(
        'fixed top-[73px] left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b border-[var(--base-border,#303034)]',
        className,
      )}
    >
      <div className="flex w-full overflow-x-auto">
        {PROFILE_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;
          const count = getCount(item.label);

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={Libs.cn(
                'flex flex-1 justify-center items-center gap-1 px-2.5 py-3.5 transition-all relative whitespace-nowrap',
                'hover:bg-secondary/10',
                isSelected
                  ? 'text-foreground border-b border-white'
                  : 'text-muted-foreground border-b border-transparent',
              )}
              aria-label={item.label}
              aria-current={isSelected ? 'page' : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {count !== undefined && <span className="text-xs font-medium">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
