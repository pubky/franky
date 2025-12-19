import type * as React from 'react';

import { POST_INPUT_ACTION_SUBMIT_MODE } from './PostInputActionBar.constants';

export type PostInputActionSubmitMode =
  (typeof POST_INPUT_ACTION_SUBMIT_MODE)[keyof typeof POST_INPUT_ACTION_SUBMIT_MODE];

export interface PostInputActionBarProps {
  onEmojiClick?: () => void;
  onImageClick?: () => void;
  onFileClick?: () => void;
  onArticleClick?: () => void;
  onPostClick?: () => void;
  isPostDisabled?: boolean;
  isSubmitting?: boolean;
  postButtonLabel?: string;
  postButtonAriaLabel?: string;
  postButtonIcon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hideArticle?: boolean;
}

export interface ActionButtonConfig {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
  labelText?: string;
}
