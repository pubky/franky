'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface DialogReplyActionBarProps {
  onEmojiClick?: () => void;
  onImageClick?: () => void;
  onFileClick?: () => void;
  onArticleClick?: () => void;
  onPostClick?: () => void;
  isPostDisabled?: boolean;
  className?: string;
}

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
  className,
}: DialogReplyActionBarProps) {
  const commonButtonProps = {
    variant: 'secondary' as const,
    size: 'sm' as const,
    className: 'h-8 px-3 py-2 rounded-full border-none',
    style: { boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' } as React.CSSProperties,
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
    <div className={Libs.cn('flex gap-2 items-center justify-end', className)}>
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
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-secondary-foreground" strokeWidth={2} />
                <span className="text-xs font-bold leading-4 text-secondary-foreground">Post</span>
              </div>
            ) : (
              <Icon className="size-4 text-secondary-foreground" strokeWidth={2} />
            )}
          </Atoms.Button>
        ),
      )}
    </div>
  );
}
