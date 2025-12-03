'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { DialogReplyActionBarProps } from './DialogReplyActionBar.types';

interface ActionButtonConfig {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  labelText?: string;
}

export function DialogReplyActionBar({
  onEmojiClick,
  onImageClick,
  onFileClick,
  onArticleClick,
  onPostClick,
  isPostDisabled = false,
}: DialogReplyActionBarProps) {
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
        disabled: !onEmojiClick,
      },
      {
        icon: Libs.Image,
        onClick: onImageClick,
        ariaLabel: 'Add image',
        disabled: !onImageClick,
      },
      {
        icon: Libs.Paperclip,
        onClick: onFileClick,
        ariaLabel: 'Add file',
        disabled: !onFileClick,
      },
      {
        icon: Libs.Newspaper,
        onClick: onArticleClick,
        ariaLabel: 'Add article',
        disabled: !onArticleClick,
      },
      {
        icon: Libs.Send,
        onClick: onPostClick,
        disabled: isPostDisabled || !onPostClick,
        ariaLabel: 'Post reply',
        showLabel: true,
        labelText: 'Post',
      },
    ],
    [onEmojiClick, onImageClick, onFileClick, onArticleClick, onPostClick, isPostDisabled],
  );

  return (
    <Atoms.Container className="flex items-center justify-end gap-2" overrideDefaults>
      {actionButtons.map(
        ({ icon: Icon, onClick, ariaLabel, disabled, className: buttonClassName, showLabel, labelText }) => (
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
                <Icon className="size-4 text-secondary-foreground" strokeWidth={2} />
                <Atoms.Typography as="span" size="sm" className="text-xs leading-4 font-bold text-secondary-foreground">
                  {labelText}
                </Atoms.Typography>
              </Atoms.Container>
            ) : (
              <Icon className="size-4 text-secondary-foreground" strokeWidth={2} />
            )}
          </Atoms.Button>
        ),
      )}
    </Atoms.Container>
  );
}
