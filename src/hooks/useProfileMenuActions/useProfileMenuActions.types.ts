import type { LucideIcon } from 'lucide-react';
import type { PROFILE_MENU_ACTION_IDS } from './useProfileMenuActions.constants';

export type ProfileMenuActionId = (typeof PROFILE_MENU_ACTION_IDS)[keyof typeof PROFILE_MENU_ACTION_IDS];

export interface ProfileMenuActionItem {
  id: ProfileMenuActionId;
  label: string;
  icon: LucideIcon;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

export interface UseProfileMenuActionsResult {
  menuItems: ProfileMenuActionItem[];
  isLoading: boolean;
}
