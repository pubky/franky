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

  return (
    <Atoms.Container className={Libs.cn('flex-row flex-1 w-auto items-center justify-end gap-2', className)}>
      {/* Tag Button */}
      <Atoms.Button
        variant="secondary"
        size="sm"
        onClick={onTagClick}
        className="border-none"
        style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
        aria-label={`Tag post (${postCounts.tags})`}
      >
        <Libs.Tag className="size-4 text-secondary-foreground" strokeWidth={2} />
        <span className="text-xs font-bold leading-4 text-muted-foreground">{postCounts.tags}</span>
      </Atoms.Button>

      {/* Reply Button */}
      <Atoms.Button
        variant="secondary"
        size="sm"
        onClick={onReplyClick}
        className="border-none"
        style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
        aria-label={`Reply to post (${postCounts.replies})`}
      >
        <Libs.MessageCircle className="size-4 text-secondary-foreground" strokeWidth={2} />
        <span className="text-xs font-bold leading-4 text-muted-foreground">{postCounts.replies}</span>
      </Atoms.Button>

      {/* Repost Button */}
      <Atoms.Button
        variant="secondary"
        size="sm"
        onClick={onRepostClick}
        className="border-none"
        style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
        aria-label={`Repost (${postCounts.reposts})`}
      >
        <Libs.Repeat className="size-4 text-secondary-foreground" strokeWidth={2} />
        <span className="text-xs font-bold leading-4 text-muted-foreground">{postCounts.reposts}</span>
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
