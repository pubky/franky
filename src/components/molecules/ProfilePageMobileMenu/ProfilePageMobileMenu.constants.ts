import * as Libs from '@/libs';
import * as Types from '@/app/profile/profile.types';
import type { ProfileMenuItem } from './ProfilePageMobileMenu.types';

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { icon: Libs.CircleUserRound, label: 'Profile', pageType: Types.PROFILE_PAGE_TYPES.PROFILE },
  {
    icon: Libs.Bell,
    label: 'Notifications',
    pageType: Types.PROFILE_PAGE_TYPES.NOTIFICATIONS,
    ownProfileOnly: true, // Notifications only make sense for logged-in user
  },
  { icon: Libs.MessageCircle, label: 'Replies', pageType: Types.PROFILE_PAGE_TYPES.REPLIES },
  { icon: Libs.StickyNote, label: 'Posts', pageType: Types.PROFILE_PAGE_TYPES.POSTS },
  { icon: Libs.UsersRound, label: 'Followers', pageType: Types.PROFILE_PAGE_TYPES.FOLLOWERS },
  { icon: Libs.UsersRound2, label: 'Following', pageType: Types.PROFILE_PAGE_TYPES.FOLLOWING },
  { icon: Libs.HeartHandshake, label: 'Friends', pageType: Types.PROFILE_PAGE_TYPES.FRIENDS },
  { icon: Libs.Tag, label: 'Tagged', pageType: Types.PROFILE_PAGE_TYPES.UNIQUE_TAGS },
];
