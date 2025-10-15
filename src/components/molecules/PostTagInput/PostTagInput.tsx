import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface PostTagInputProps {
  /** Input ref */
  ref?: React.RefObject<HTMLInputElement>;
  /** Current input value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Show emoji picker button */
  showEmojiPicker?: boolean;
  /** Callback when input value changes */
  onChange?: (value: string) => void;
  /** Callback when Enter is pressed */
  onSubmit?: (value: string) => void;
  /** Callback when input loses focus */
  onBlur?: () => void;
  /** Callback when emoji picker is clicked */
  onEmojiClick?: () => void;
  /** Additional className */
  className?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

export function PostTagInput({
  value = '',
  placeholder = 'add tag',
  showEmojiPicker = false,
  onChange,
  onSubmit,
  onBlur,
  onEmojiClick,
  className,
  autoFocus = false,
}: PostTagInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onSubmit?.(value.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const InputBox = (
    <div
      className={Libs.cn(
        'relative flex h-8 items-center rounded-lg px-3',
        'border border-dashed border-input focus-within:border-white/80',
        className,
      )}
    >
      <Atoms.Input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Add new tag"
        className={Libs.cn(
          'flex-1 bg-transparent text-sm font-bold leading-5 outline-none caret-white',
          'border-none shadow-none ring-0 focus:ring-0 focus:outline-none focus:ring-offset-0 hover:outline-none',
          'p-0 h-6',
          showEmojiPicker ? 'pr-6' : undefined,
          'placeholder:text-input placeholder:font-bold',
          value ? 'text-secondary-foreground' : 'text-input',
        )}
      />

      {/* Emoji inside dashed area (both sizes) */}
      {showEmojiPicker && (
        <div className="pointer-events-auto absolute right-1 top-1/2 -translate-y-1/2">
          <Atoms.Button
            variant="secondary"
            size="icon"
            onClick={onEmojiClick}
            className="size-5 border-none p-1"
            style={{ boxShadow: '0px 1px 2px 0px rgba(5, 5, 10, 0.2)' }}
            aria-label="Open emoji picker"
          >
            <Libs.Smile className="size-3" strokeWidth={2} />
          </Atoms.Button>
        </div>
      )}
    </div>
  );
  return InputBox;
}
