'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Shared from '@/shared/postActionVariants';

export interface DialogActionBarProps {
  variant: Shared.PostActionVariant;
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

const VARIANT_CONFIG: Record<
  Shared.PostActionVariant,
  { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; ariaLabel: string; labelText: string }
> = {
  [Shared.POST_ACTION_VARIANT.REPLY]: {
    icon: Libs.Send,
    ariaLabel: 'Post reply',
    labelText: 'Post',
  },
  [Shared.POST_ACTION_VARIANT.REPOST]: {
    icon: Libs.Repeat,
    ariaLabel: 'Repost',
    labelText: 'Repost',
  },
  [Shared.POST_ACTION_VARIANT.NEW]: {
    icon: Libs.Send,
    ariaLabel: 'Post',
    labelText: 'Post',
  },
};

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

  const variantConfig = VARIANT_CONFIG[variant];

  const actionButtonConfig: ActionButtonConfig = {
    icon: variantConfig.icon,
    onClick: onActionClick,
    disabled: isActionDisabled,
    ariaLabel: variantConfig.ariaLabel,
    className: Libs.cn(isActionDisabled && 'opacity-40'),
    showLabel: true,
    labelText: variantConfig.labelText,
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
