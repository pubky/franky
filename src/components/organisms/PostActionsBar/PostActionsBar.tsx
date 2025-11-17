'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface PostActionsBarProps {
  postId: string;
  onTagClick?: () => void;
  onReplyClick?: () => void;
  onRepostClick?: () => void;
  onBookmarkClick?: () => void;
  onMoreClick?: () => void;
  className?: string;
}

interface ActionButtonConfig {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; fill?: string }>;
  count?: number;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
  iconProps?: { fill?: string };
}

export function PostActionsBar({
  postId,
  onTagClick,
  onReplyClick,
  onRepostClick,
  onBookmarkClick,
  onMoreClick,
  className,
}: PostActionsBarProps) {
  // Fetch post counts
  const postCounts = useLiveQuery(async () => {
    return await Core.PostCountsModel.findById(postId);
  }, [postId]);

  // Check if post is bookmarked (future enhancement)
  const isBookmarked = false; // TODO: implement bookmark check

  if (!postCounts) {
    // TODO: Add skeleton loading component for PostActionsBar
    return <div className="text-muted-foreground">Loading actions...</div>;
  }

  const commonButtonProps = {
    variant: 'secondary' as const,
    size: 'sm' as const,
    className: 'border-none shadow-xs-dark',
  };

  const actionButtons: ActionButtonConfig[] = [
    {
      icon: Libs.Tag,
      count: postCounts.tags,
      onClick: onTagClick,
      ariaLabel: `Tag post (${postCounts.tags})`,
    },
    {
      icon: Libs.MessageCircle,
      count: postCounts.replies,
      onClick: onReplyClick,
      ariaLabel: `Reply to post (${postCounts.replies})`,
    },
    {
      icon: Libs.Repeat,
      count: postCounts.reposts,
      onClick: onRepostClick,
      ariaLabel: `Repost (${postCounts.reposts})`,
    },
    {
      icon: Libs.Bookmark,
      onClick: onBookmarkClick,
      ariaLabel: isBookmarked ? 'Remove bookmark' : 'Add bookmark',
      className: 'w-10',
      iconProps: { fill: isBookmarked ? 'currentColor' : 'none' },
    },
    {
      icon: Libs.Ellipsis,
      onClick: onMoreClick,
      ariaLabel: 'More options',
    },
  ];

  return (
    <div className={Libs.cn('flex gap-2', className)}>
      {actionButtons.map(({ icon: Icon, count, onClick, ariaLabel, className: buttonClassName, iconProps }, index) => (
        <Atoms.Button
          key={index}
          {...commonButtonProps}
          onClick={onClick}
          className={Libs.cn(commonButtonProps.className, buttonClassName)}
          aria-label={ariaLabel}
        >
          <Icon {...iconProps} />
          {count !== undefined && <span className="text-xs leading-4 font-bold text-muted-foreground">{count}</span>}
        </Atoms.Button>
      ))}
    </div>
  );
}
