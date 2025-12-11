import * as React from 'react';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Types from '@/app/profile/profile.types';

// Item configuration - single source of truth for filter items
export const FILTER_ITEMS_CONFIG: Array<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  pageType: Types.FilterBarPageType;
  statKey: keyof Hooks.ProfileStats;
  /** Whether this item should only be shown for own profile */
  ownProfileOnly?: boolean;
}> = [
  {
    icon: Libs.Bell,
    label: 'Notifications',
    pageType: Types.PROFILE_PAGE_TYPES.NOTIFICATIONS,
    statKey: 'notifications',
    ownProfileOnly: true, // Notifications only make sense for logged-in user
  },
  {
    icon: Libs.StickyNote,
    label: 'Posts',
    pageType: Types.PROFILE_PAGE_TYPES.POSTS,
    statKey: 'posts',
  },
  {
    icon: Libs.MessageCircle,
    label: 'Replies',
    pageType: Types.PROFILE_PAGE_TYPES.REPLIES,
    statKey: 'replies',
  },
  {
    icon: Libs.UsersRound,
    label: 'Followers',
    pageType: Types.PROFILE_PAGE_TYPES.FOLLOWERS,
    statKey: 'followers',
  },
  {
    icon: Libs.UsersRound2,
    label: 'Following',
    pageType: Types.PROFILE_PAGE_TYPES.FOLLOWING,
    statKey: 'following',
  },
  {
    icon: Libs.HeartHandshake,
    label: 'Friends',
    pageType: Types.PROFILE_PAGE_TYPES.FRIENDS,
    statKey: 'friends',
  },
  {
    icon: Libs.Tag,
    label: 'Tagged',
    pageType: Types.PROFILE_PAGE_TYPES.UNIQUE_TAGS,
    statKey: 'uniqueTags',
  },
];
