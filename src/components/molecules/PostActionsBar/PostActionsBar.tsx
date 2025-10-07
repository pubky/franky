'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface PostActionsBarProps {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  tagCount?: number;
  replyCount?: number;
  repostCount?: number;
  isBookmarked?: boolean;
  onTagClick?: () => void;
  onReplyClick?: () => void;
  onRepostClick?: () => void;
  onBookmarkClick?: () => void;
  onMoreClick?: () => void;
}

export function PostActionsBar({
  className,
  tagCount = 0,
  replyCount = 0,
  repostCount = 0,
  isBookmarked = false,
  onTagClick,
  onReplyClick,
  onRepostClick,
  onBookmarkClick,
  onMoreClick,
}: PostActionsBarProps) {
  return (
    <Atoms.Container className={Libs.cn('flex-row items-center justify-end gap-2', className)}>
      {/* Tag Button */}
      <Atoms.Button
        variant="secondary"
        size="sm"
        onClick={onTagClick}
        className="border-none"
        style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
        aria-label={`Tag post (${tagCount})`}
      >
        <Libs.Tag className="size-4 text-secondary-foreground" strokeWidth={2} />
        <span className="text-xs font-bold leading-4 text-muted-foreground">{tagCount}</span>
      </Atoms.Button>

      {/* Reply Button */}
      <Atoms.Button
        variant="secondary"
        size="sm"
        onClick={onReplyClick}
        className="border-none"
        style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
        aria-label={`Reply to post (${replyCount})`}
      >
        <Libs.MessageCircle className="size-4 text-secondary-foreground" strokeWidth={2} />
        <span className="text-xs font-bold leading-4 text-muted-foreground">{replyCount}</span>
      </Atoms.Button>

      {/* Repost Button */}
      <Atoms.Button
        variant="secondary"
        size="sm"
        onClick={onRepostClick}
        className="border-none"
        style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
        aria-label={`Repost (${repostCount})`}
      >
        <Libs.Repeat className="size-4 text-secondary-foreground" strokeWidth={2} />
        <span className="text-xs font-bold leading-4 text-muted-foreground">{repostCount}</span>
      </Atoms.Button>

      {/* Bookmark Button */}
      <Atoms.Button
        variant="secondary"
        size="sm"
        onClick={onBookmarkClick}
        className="w-10 border-none"
        style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Libs.Bookmark
          className="size-4 text-secondary-foreground"
          strokeWidth={2}
          fill={isBookmarked ? 'currentColor' : 'none'}
        />
      </Atoms.Button>

      {/* More Button */}
      <Atoms.Button
        variant="secondary"
        size="sm"
        onClick={onMoreClick}
        className="border-none"
        style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
        aria-label="More options"
      >
        <Libs.Ellipsis className="size-4 text-secondary-foreground" strokeWidth={2} />
      </Atoms.Button>
    </Atoms.Container>
  );
}
