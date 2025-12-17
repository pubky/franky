'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';
import type { PostActionsBarProps, ActionButtonConfig } from './PostActionsBar.types';

export function PostActionsBar({ postId, onTagClick, onReplyClick, onRepostClick, className }: PostActionsBarProps) {
  // Fetch post counts
  const postCounts = useLiveQuery(async () => {
    return await Core.PostController.getCounts({ compositeId: postId });
  }, [postId]);

  // Bookmark state and toggle
  const {
    isBookmarked,
    isLoading: isBookmarkLoading,
    isToggling: isBookmarkToggling,
    toggle: toggleBookmark,
  } = Hooks.useBookmark(postId);
  const isBookmarkBusy = isBookmarkLoading || isBookmarkToggling;

  if (!postCounts) {
    // TODO: Add skeleton loading component for PostActionsBar
    return (
      <Atoms.Container overrideDefaults className="text-muted-foreground">
        Loading actions...
      </Atoms.Container>
    );
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
      icon: isBookmarkBusy ? Libs.Loader2 : Libs.Bookmark,
      onClick: toggleBookmark,
      ariaLabel: isBookmarkBusy ? 'Loading...' : isBookmarked ? 'Remove bookmark' : 'Add bookmark',
      className: 'w-10',
      iconProps: {
        fill: isBookmarked && !isBookmarkBusy ? 'currentColor' : 'none',
        className: isBookmarkBusy ? 'animate-spin' : undefined,
      },
      disabled: isBookmarkBusy,
    },
  ];

  const moreButtonTrigger = (
    <Atoms.Button {...commonButtonProps} aria-label="More options" className={Libs.cn(commonButtonProps.className)}>
      <Libs.Ellipsis />
    </Atoms.Button>
  );

  return (
    <Atoms.Container overrideDefaults className={Libs.cn('flex gap-2', className)}>
      {actionButtons.map(
        ({ icon: Icon, count, onClick, ariaLabel, className: buttonClassName, iconProps, disabled }, index) => (
          <Atoms.Button
            key={index}
            {...commonButtonProps}
            onClick={onClick}
            disabled={disabled}
            className={Libs.cn(commonButtonProps.className, buttonClassName)}
            aria-label={ariaLabel}
          >
            <Icon {...iconProps} />
            {count !== undefined && <span className="text-xs leading-4 font-bold text-muted-foreground">{count}</span>}
          </Atoms.Button>
        ),
      )}
      <Organisms.PostMenuActions postId={postId} trigger={moreButtonTrigger} />
    </Atoms.Container>
  );
}
