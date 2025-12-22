export interface PostMenuActionsContentProps {
  postId: string;
  variant: 'dropdown' | 'sheet';
  onActionComplete?: () => void;
}
