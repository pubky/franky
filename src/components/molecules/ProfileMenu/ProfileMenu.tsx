'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { PROFILE_ROUTES } from '@/app';

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { icon: Libs.Bell, label: 'Notifications', path: PROFILE_ROUTES.NOTIFICATIONS },
  { icon: Libs.StickyNote, label: 'Posts', path: PROFILE_ROUTES.POSTS },
  { icon: Libs.MessageCircle, label: 'Replies', path: PROFILE_ROUTES.REPLIES },
  { icon: Libs.UsersRound, label: 'Followers', path: PROFILE_ROUTES.FOLLOWERS },
  { icon: Libs.UsersRound2, label: 'Following', path: PROFILE_ROUTES.FOLLOWING },
  { icon: Libs.HeartHandshake, label: 'Friends', path: PROFILE_ROUTES.FRIENDS },
  { icon: Libs.Tag, label: 'Tagged', path: PROFILE_ROUTES.TAGGED },
];

export interface ProfileMenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

export interface ProfileMenuProps {
  className?: string;
  counts?: {
    notifications?: number;
    posts?: number;
    replies?: number;
    followers?: number;
    following?: number;
    friends?: number;
    tagged?: number;
  };
}

export function ProfileMenu({ className, counts }: ProfileMenuProps) {
  const pathname = usePathname();

  const getCount = (label: string) => {
    if (!counts) return undefined;
    switch (label) {
      case 'Notifications':
        return counts.notifications;
      case 'Posts':
        return counts.posts;
      case 'Replies':
        return counts.replies;
      case 'Followers':
        return counts.followers;
      case 'Following':
        return counts.following;
      case 'Friends':
        return counts.friends;
      case 'Tagged':
        return counts.tagged;
      default:
        return undefined;
    }
  };

  return (
    <Atoms.FilterRoot className={className}>
      <Atoms.FilterList>
        {PROFILE_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;
          const count = getCount(item.label);
          return (
            <Link key={item.label} href={item.path}>
              <Atoms.FilterItem isSelected={isSelected} onClick={() => {}}>
                <Atoms.FilterItemIcon icon={Icon} />
                <Atoms.FilterItemLabel>
                  {item.label}
                  {count !== undefined && ` (${count})`}
                </Atoms.FilterItemLabel>
              </Atoms.FilterItem>
            </Link>
          );
        })}
      </Atoms.FilterList>
    </Atoms.FilterRoot>
  );
}
