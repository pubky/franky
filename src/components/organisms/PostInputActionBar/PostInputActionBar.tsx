'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { PostInputActionBarProps, ActionButtonConfig } from './PostInputActionBar.types';

export function PostInputActionBar({
  onEmojiClick,
  onImageClick,
  onFileClick,
  onArticleClick,
  onPostClick,
  isPostDisabled = false,
  isSubmitting = false,
}: PostInputActionBarProps) {
  const commonButtonProps = React.useMemo(
    () => ({
      variant: 'secondary' as const,
      size: 'sm' as const,
      className: 'h-8 px-3 py-2 rounded-full border-none shadow-xs-dark',
    }),
    [],
  );

  const actionButtons: ActionButtonConfig[] = React.useMemo(
    () => [
      {
        icon: Libs.Smile,
        onClick: onEmojiClick,
        ariaLabel: 'Add emoji',
        disabled: !onEmojiClick || isSubmitting,
      },
      {
        icon: Libs.Image,
        onClick: onImageClick,
        ariaLabel: 'Add image',
        disabled: !onImageClick || isSubmitting,
      },
      {
        icon: Libs.Paperclip,
        onClick: onFileClick,
        ariaLabel: 'Add file',
        disabled: !onFileClick || isSubmitting,
      },
      {
        icon: Libs.Newspaper,
        onClick: onArticleClick,
        ariaLabel: 'Add article',
        disabled: !onArticleClick || isSubmitting,
      },
      {
        icon: isSubmitting ? Libs.Loader2 : Libs.Send,
        onClick: onPostClick,
        disabled: isPostDisabled || !onPostClick,
        ariaLabel: isSubmitting ? 'Posting...' : 'Post reply',
        showLabel: true,
        labelText: isSubmitting ? 'Posting...' : 'Post',
        iconClassName: isSubmitting ? 'animate-spin' : undefined,
      },
    ],
    [onEmojiClick, onImageClick, onFileClick, onArticleClick, onPostClick, isPostDisabled, isSubmitting],
  );

  return (
    <Atoms.Container className="flex items-center justify-end gap-2" overrideDefaults>
      {actionButtons.map(
        ({
          icon: Icon,
          onClick,
          ariaLabel,
          disabled,
          className: buttonClassName,
          iconClassName,
          showLabel,
          labelText,
        }) => (
          <Atoms.Button
            key={ariaLabel}
            {...commonButtonProps}
            onClick={onClick}
            disabled={disabled}
            className={Libs.cn(commonButtonProps.className, buttonClassName)}
            aria-label={ariaLabel}
          >
            {showLabel && labelText ? (
              <Atoms.Container className="flex items-center gap-2" overrideDefaults>
                <Icon className={Libs.cn('size-4 text-secondary-foreground', iconClassName)} strokeWidth={2} />
                <Atoms.Typography as="span" size="sm" className="text-xs leading-4 font-bold text-secondary-foreground">
                  {labelText}
                </Atoms.Typography>
              </Atoms.Container>
            ) : (
              <Icon className={Libs.cn('size-4 text-secondary-foreground', iconClassName)} strokeWidth={2} />
            )}
          </Atoms.Button>
        ),
      )}
    </Atoms.Container>
  );
}
