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
}

export function DialogReplyActionBar({
  onEmojiClick,
  onImageClick,
  onFileClick,
  onArticleClick,
  onPostClick,
  isPostDisabled = false,
}: DialogReplyActionBarProps) {
  const commonButtonProps = {
    variant: 'secondary' as const,
    size: 'sm' as const,
    className: 'h-8 px-3 py-2 rounded-full border-none shadow-xs-dark',
  };

  const actionButtons: ActionButtonConfig[] = [
    {
      icon: Libs.Smile,
      onClick: onEmojiClick,
      ariaLabel: 'Add emoji',
    },
    {
      icon: Libs.Image,
      onClick: onImageClick,
      ariaLabel: 'Add image',
    },
    {
      icon: Libs.Paperclip,
      onClick: onFileClick,
      ariaLabel: 'Add file',
    },
    {
      icon: Libs.Newspaper,
      onClick: onArticleClick,
      ariaLabel: 'Add article',
    },
    {
      icon: Libs.Send,
      onClick: onPostClick,
      disabled: isPostDisabled,
      ariaLabel: 'Post reply',
      className: Libs.cn(isPostDisabled && 'opacity-40'),
      showLabel: true,
    },
  ];

  return (
    <Atoms.Container className="flex items-center justify-end gap-2" overrideDefaults>
      {actionButtons.map(
        ({ icon: Icon, onClick, ariaLabel, disabled, className: buttonClassName, showLabel }, index) => (
          <Atoms.Button
            key={index}
            {...commonButtonProps}
            onClick={onClick}
            disabled={disabled}
            className={Libs.cn(commonButtonProps.className, buttonClassName)}
            aria-label={ariaLabel}
          >
            {showLabel ? (
              <Atoms.Container className="flex items-center gap-2" overrideDefaults>
                <Icon className="size-4 text-secondary-foreground" strokeWidth={2} />
                <Atoms.Typography as="span" size="sm" className="text-xs leading-4 font-bold text-secondary-foreground">
                  Post
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
