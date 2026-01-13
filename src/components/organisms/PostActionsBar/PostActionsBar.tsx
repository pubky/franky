'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';
import type { PostActionsBarProps, ActionButtonConfig } from './PostActionsBar.types';

const buttonProps = {
  variant: 'secondary' as const,
  size: 'sm' as const,
  className: 'border-none shadow-xs-dark',
};

export function PostActionsBar({ postId, onTagClick, onReplyClick, onRepostClick, className }: PostActionsBarProps) {
  const { postCounts, isLoading: isCountsLoading } = Hooks.usePostCounts(postId);
  const {
    isBookmarked,
    isLoading: isBookmarkLoading,
    isToggling: isBookmarkToggling,
    toggle: toggleBookmark,
  } = Hooks.useBookmark(postId);
  const { requireAuth } = Hooks.useRequireAuth();

  const isBookmarkBusy = isBookmarkLoading || isBookmarkToggling;

  if (isCountsLoading || !postCounts) {
    return (
      <Atoms.Container overrideDefaults className="text-muted-foreground">
        Loading actions...
      </Atoms.Container>
    );
  }

  const actionButtons: ActionButtonConfig[] = [
    {
      id: 'tag',
      icon: Libs.Tag,
      count: postCounts.tags,
      onClick: () => requireAuth(() => onTagClick?.()),
      ariaLabel: `Tag post (${postCounts.tags})`,
    },
    {
      id: 'reply',
      icon: Libs.MessageCircle,
      count: postCounts.replies,
      onClick: () => requireAuth(() => onReplyClick?.()),
      ariaLabel: `Reply to post (${postCounts.replies})`,
    },
    {
      id: 'repost',
      icon: Libs.Repeat,
      count: postCounts.reposts,
      onClick: () => requireAuth(() => onRepostClick?.()),
      ariaLabel: `Repost (${postCounts.reposts})`,
    },
    {
      id: 'bookmark',
      icon: isBookmarkBusy ? Libs.Loader2 : Libs.Bookmark,
      onClick: () => requireAuth(() => toggleBookmark()),
      ariaLabel: isBookmarkBusy ? 'Loading...' : isBookmarked ? 'Remove bookmark' : 'Add bookmark',
      className: 'w-10',
      iconProps: {
        fill: isBookmarked && !isBookmarkBusy ? 'currentColor' : 'none',
        className: isBookmarkBusy ? 'animate-spin' : undefined,
      },
      disabled: isBookmarkBusy,
    },
  ];

  return (
    <Atoms.Container overrideDefaults className={Libs.cn('flex gap-2', className)}>
      {actionButtons.map(({ id, icon: Icon, count, onClick, ariaLabel, className: btnClass, iconProps, disabled }) => (
        <Atoms.Button
          key={id}
          {...buttonProps}
          onClick={onClick}
          disabled={disabled}
          className={Libs.cn(buttonProps.className, btnClass)}
          aria-label={ariaLabel}
        >
          <Icon {...iconProps} />
          {count !== undefined && (
            <Atoms.Typography as="span" overrideDefaults className="text-xs leading-4 font-bold text-muted-foreground">
              {count}
            </Atoms.Typography>
          )}
        </Atoms.Button>
      ))}
      <Organisms.PostMenuActions
        postId={postId}
        trigger={
          <Atoms.Button {...buttonProps} aria-label="More options">
            <Libs.Ellipsis />
          </Atoms.Button>
        }
      />
    </Atoms.Container>
  );
}
