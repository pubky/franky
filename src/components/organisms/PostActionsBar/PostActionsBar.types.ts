export interface PostActionsBarProps {
  postId: string;
  onTagClick?: () => void;
  onReplyClick?: () => void;
  onRepostClick?: () => void;
  onMoreClick?: () => void;
  className?: string;
}

export interface ActionButtonConfig {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; fill?: string }>;
  count?: number;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
  iconProps?: { fill?: string; className?: string };
  disabled?: boolean;
}
