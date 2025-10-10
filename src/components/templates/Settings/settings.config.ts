import * as Libs from '@/libs';
import { SETTINGS_ROUTES } from '@/app';

export interface SettingsMenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  { icon: Libs.UserRound, label: 'Account', path: SETTINGS_ROUTES.ACCOUNT },
  { icon: Libs.Bell, label: 'Notifications', path: SETTINGS_ROUTES.NOTIFICATIONS },
  { icon: Libs.Shield, label: 'Privacy & Safety', path: SETTINGS_ROUTES.PRIVACY_SAFETY },
  { icon: Libs.MegaphoneOff, label: 'Muted Users', path: SETTINGS_ROUTES.MUTED_USERS },
  { icon: Libs.Globe, label: 'Language', path: SETTINGS_ROUTES.LANGUAGE },
  { icon: Libs.CircleHelp, label: 'Help', path: SETTINGS_ROUTES.HELP },
];

export const SETTINGS_LOADING_DELAY_MS = 500;
