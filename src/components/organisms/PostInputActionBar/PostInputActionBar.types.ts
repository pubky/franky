import type * as React from 'react';

import type { PostInputVariant } from '../PostInput/PostInput.types';

export type PostInputActionSubmitMode = PostInputVariant;

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
  hideArticleButton: boolean;
  isArticle?: boolean;
  isEdit?: boolean;
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
