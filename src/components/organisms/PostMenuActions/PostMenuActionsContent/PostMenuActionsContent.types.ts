import type { MenuVariant } from '@/config/ui';

export interface PostMenuActionsContentProps {
  postId: string;
  variant: MenuVariant;
  /** Callback when any action completes (used to close menu) */
  onActionComplete: () => void;
  /** Callback when report action is clicked */
  onReportClick: () => void;
}
