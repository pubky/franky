import * as Libs from '@/libs';
import * as App from '@/app';
import type { NavigationItem } from './Header.types';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: App.APP_ROUTES.HOME, icon: Libs.Home, label: 'Home' },
  { href: App.APP_ROUTES.HOT, icon: Libs.Flame, label: 'Hot' },
  { href: App.APP_ROUTES.BOOKMARKS, icon: Libs.Bookmark, label: 'Bookmarks' },
  { href: App.APP_ROUTES.SETTINGS, icon: Libs.Settings, label: 'Settings' },
];
