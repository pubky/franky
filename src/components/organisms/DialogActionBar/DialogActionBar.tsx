'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export type DialogActionBarVariant = 'reply' | 'repost' | 'new';

export interface DialogActionBarProps {
  variant: DialogActionBarVariant;
  onEmojiClick?: () => void;
  onImageClick?: () => void;
  onFileClick?: () => void;
  onArticleClick?: () => void;
  onActionClick?: () => void;
  isActionDisabled?: boolean;
  className?: string;
}

interface ActionButtonConfig {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  labelText?: string;
}

export function DialogActionBar({
  variant,
  onEmojiClick,
  onImageClick,
  onFileClick,
  onArticleClick,
  onActionClick,
  isActionDisabled = false,
  className,
}: DialogActionBarProps) {
  const commonButtonProps = {
    variant: 'secondary' as const,
    size: 'sm' as const,
    className: 'h-8 px-3 py-2 rounded-full border-none shadow-xs-dark',
  };

  const actionButtonConfig: ActionButtonConfig = {
    icon: variant === 'reply' ? Libs.Send : variant === 'repost' ? Libs.Repeat : Libs.Send,
    onClick: onActionClick,
    disabled: isActionDisabled,
    ariaLabel: variant === 'reply' ? 'Post reply' : variant === 'repost' ? 'Repost' : 'Post',
    className: Libs.cn(isActionDisabled && 'opacity-40'),
    showLabel: true,
    labelText: variant === 'reply' ? 'Post' : variant === 'repost' ? 'Repost' : 'Post',
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
    actionButtonConfig,
  ];

  return (
    <div className={Libs.cn('flex gap-2 items-center justify-end', className)}>
      {actionButtons.map(
        ({ icon: Icon, onClick, ariaLabel, disabled, className: buttonClassName, showLabel, labelText }, index) => (
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
                <span className="text-xs font-bold leading-4 text-secondary-foreground">{labelText}</span>
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
