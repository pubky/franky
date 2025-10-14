'use client';

import * as Libs from '@/libs';
import { PROFILE_ROUTES } from '@/app';

export interface ProfileCounts {
  notifications?: number;
  posts?: number;
  replies?: number;
  followers?: number;
  following?: number;
  friends?: number;
  tagged?: number;
}

export interface ProfileMenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { icon: Libs.Bell, label: 'Notifications', path: PROFILE_ROUTES.NOTIFICATIONS },
  { icon: Libs.StickyNote, label: 'Posts', path: PROFILE_ROUTES.POSTS },
  { icon: Libs.MessageCircle, label: 'Replies', path: PROFILE_ROUTES.REPLIES },
  { icon: Libs.UsersRound, label: 'Followers', path: PROFILE_ROUTES.FOLLOWERS },
  { icon: Libs.UsersRound2, label: 'Following', path: PROFILE_ROUTES.FOLLOWING },
  { icon: Libs.HeartHandshake, label: 'Friends', path: PROFILE_ROUTES.FRIENDS },
  { icon: Libs.Tag, label: 'Tagged', path: PROFILE_ROUTES.TAGGED },
];

const labelToKey = {
  Notifications: 'notifications',
  Posts: 'posts',
  Replies: 'replies',
  Followers: 'followers',
  Following: 'following',
  Friends: 'friends',
  Tagged: 'tagged',
} as const;

export function getProfileCount(label: string, counts?: ProfileCounts): number | undefined {
  if (!counts) return undefined;
  const key = (labelToKey as Record<string, keyof ProfileCounts | undefined>)[label];
  return key ? counts[key] : undefined;
}
