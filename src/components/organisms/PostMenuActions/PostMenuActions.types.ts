import { POST_MENU_VARIANT } from './PostMenuActions.constants';

export type PostMenuVariant = (typeof POST_MENU_VARIANT)[keyof typeof POST_MENU_VARIANT];

export interface PostMenuActionsProps {
  postId: string;
  trigger: React.ReactNode;
}
