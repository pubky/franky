'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';
import type { PostActionsBarProps, ActionButtonConfig } from './PostActionsBar.types';

export function PostActionsBar({ postId, onTagClick, onReplyClick, onRepostClick, className }: PostActionsBarProps) {
  const { postCounts, isLoading: isCountsLoading } = Hooks.usePostCounts(postId);

  const {
    isBookmarked,
    isLoading: isBookmarkLoading,
    isToggling: isBookmarkToggling,
    toggle: toggleBookmark,
  } = Hooks.useBookmark(postId);

  const isBookmarkBusy = isBookmarkLoading || isBookmarkToggling;

  if (isCountsLoading || !postCounts) {
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
      id: 'tag',
      icon: Libs.Tag,
      count: postCounts.tags,
      onClick: onTagClick,
      ariaLabel: `Tag post (${postCounts.tags})`,
    },
    {
      id: 'reply',
      icon: Libs.MessageCircle,
      count: postCounts.replies,
      onClick: onReplyClick,
      ariaLabel: `Reply to post (${postCounts.replies})`,
    },
    {
      id: 'repost',
      icon: Libs.Repeat,
      count: postCounts.reposts,
      onClick: onRepostClick,
      ariaLabel: `Repost (${postCounts.reposts})`,
    },
    {
      id: 'bookmark',
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

  const moreButton = (
    <Atoms.Button {...commonButtonProps} aria-label="More options" data-cy="post-more-btn">
      <Libs.Ellipsis />
    </Atoms.Button>
  );

  return (
    <Atoms.Container overrideDefaults className={Libs.cn('flex gap-2', className)}>
      {actionButtons.map(
        ({ id, icon: Icon, count, onClick, ariaLabel, className: buttonClassName, iconProps, disabled }) => (
          <Atoms.Button
            key={id}
            data-cy={`post-${id}-btn`}
            {...commonButtonProps}
            onClick={onClick}
            disabled={disabled}
            className={Libs.cn(commonButtonProps.className, buttonClassName)}
            aria-label={ariaLabel}
          >
            <Icon {...iconProps} />
            {count !== undefined && (
              <Atoms.Typography
                as="span"
                overrideDefaults
                className="text-xs leading-4 font-bold text-muted-foreground"
              >
                {count}
              </Atoms.Typography>
            )}
          </Atoms.Button>
        ),
      )}
      <Organisms.PostMenuActions postId={postId} trigger={moreButton} />
    </Atoms.Container>
  );
}
