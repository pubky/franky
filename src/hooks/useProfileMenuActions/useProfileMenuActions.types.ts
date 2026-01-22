import type { LucideIcon } from 'lucide-react';
import type { PROFILE_MENU_ACTION_IDS, PROFILE_MENU_ACTION_VARIANTS } from './useProfileMenuActions.constants';

export type ProfileMenuActionId = (typeof PROFILE_MENU_ACTION_IDS)[keyof typeof PROFILE_MENU_ACTION_IDS];
export type ProfileMenuActionVariant = (typeof PROFILE_MENU_ACTION_VARIANTS)[keyof typeof PROFILE_MENU_ACTION_VARIANTS];

export interface ProfileMenuActionItem {
  id: ProfileMenuActionId;
  label: string;
  icon: LucideIcon;
  onClick: () => void | Promise<void>;
  variant: ProfileMenuActionVariant;
  disabled?: boolean;
}

export interface UseProfileMenuActionsResult {
  menuItems: ProfileMenuActionItem[];
  isLoading: boolean;
}
