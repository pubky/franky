import type * as React from 'react';

export interface DialogReplyActionBarProps {
  onEmojiClick?: () => void;
  onImageClick?: () => void;
  onFileClick?: () => void;
  onArticleClick?: () => void;
  onPostClick?: () => void;
  isPostDisabled?: boolean;
  isSubmitting?: boolean;
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
