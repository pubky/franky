import type { MENU_VARIANT } from '@/config/ui';

export interface ProfileMenuActionsContentProps {
  userId: string;
  variant: (typeof MENU_VARIANT)[keyof typeof MENU_VARIANT];
  onActionComplete: () => void;
}
