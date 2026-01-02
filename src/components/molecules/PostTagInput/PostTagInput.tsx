import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface PostTagInputProps {
  /** Current input value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Show emoji picker button */
  showEmojiPicker?: boolean;
  /** Callback when the input value changes */
  onChange?: (value: string) => void;
  /** Callback when Enter is pressed */
  onSubmit?: (value: string) => void;
  /** Callback when input loses focus */
  onBlur?: () => void;
  /** Callback when the emoji picker is clicked */
  onEmojiClick?: () => void;
  /** Additional className */
  className?: string;
  /** Autofocus on mount */
  autoFocus?: boolean;
}

export const PostTagInput = React.forwardRef<HTMLInputElement, PostTagInputProps>(
  (
    {
      value = '',
      placeholder = 'add tag',
      showEmojiPicker = false,
      onChange,
      onSubmit,
      onBlur,
      onEmojiClick,
      className,
      autoFocus = false,
    },
    ref,
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && value.trim()) {
        e.preventDefault();
        e.stopPropagation();
        onSubmit?.(value.trim());
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value.toLowerCase());
    };

    return (
      <div
        className={Libs.cn(
          'relative flex h-8 items-center rounded-lg px-3',
          'border border-dashed border-input focus-within:border-white/80',
          className,
        )}
      >
        <Atoms.Input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Add new tag"
          className={Libs.cn(
            'flex-1 bg-transparent text-sm leading-5 font-bold caret-white outline-none',
            'border-none shadow-none ring-0 hover:outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none',
            'h-6 p-0',
            showEmojiPicker ? 'pr-6' : undefined,
            'placeholder:font-bold placeholder:text-input',
            value ? 'text-secondary-foreground' : 'text-input',
          )}
        />

        {/* Emoji inside dashed area (both sizes) */}
        {showEmojiPicker && (
          <div className="pointer-events-auto absolute top-1/2 right-1 -translate-y-1/2">
            <Atoms.Button
              variant="secondary"
              size="icon"
              onClick={onEmojiClick}
              className="size-5 border-none p-1 shadow-xs-dark"
              aria-label="Open emoji picker"
            >
              <Libs.Smile className="size-3" strokeWidth={2} />
            </Atoms.Button>
          </div>
        )}
      </div>
    );
  },
);

PostTagInput.displayName = 'PostTagInput';
