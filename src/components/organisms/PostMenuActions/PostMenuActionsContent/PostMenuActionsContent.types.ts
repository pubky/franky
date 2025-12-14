import type { PostMenuVariant } from '../PostMenuActions.types';

export interface PostMenuActionsContentProps {
  postId: string;
  onClose?: () => void;
  variant?: PostMenuVariant;
}
