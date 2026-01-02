import type { MenuVariant } from '@/config/ui';

export interface PostMenuActionsContentProps {
  postId: string;
  variant: MenuVariant;
  onActionComplete?: () => void;
}
