import { useCallback } from 'react';

export interface UseEmojiInputOptions {
  /** Current input value */
  value: string;
  /** Function to update the input value - accepts both React state setter and simple string setter */
  setValue: (value: string) => void;
  /** Ref to the input/textarea element */
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  /** Optional callback to close the emoji picker */
  onClose?: () => void;
}

/**
 * Hook to handle emoji insertion into text inputs/textareas at cursor position
 *
 * @example
 * const { handleEmojiSelect } = useEmojiInput({
 *   value: inputValue,
 *   setValue: setInputValue,
 *   inputRef: inputRef,
 *   onClose: () => setShowEmojiPicker(false),
 * });
 */
export function useEmojiInput({ value, setValue, inputRef, onClose }: UseEmojiInputOptions) {
  const handleEmojiSelect = useCallback(
    (emoji: { native: string }) => {
      const input = inputRef.current;

      if (input) {
        // Get cursor position
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;

        // Insert emoji at cursor position
        const newValue = value.slice(0, start) + emoji.native + value.slice(end);
        setValue(newValue);

        // Set cursor position after emoji
        setTimeout(() => {
          input.focus();
          const newCursorPos = start + emoji.native.length;
          input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      } else {
        // Fallback: append emoji if no ref available
        setValue(value + emoji.native);
      }

      // Close emoji picker if callback provided
      onClose?.();
    },
    [value, setValue, inputRef, onClose],
  );

  return { handleEmojiSelect };
}
