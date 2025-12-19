'use client';

import { useCallback } from 'react';
import type { UseEmojiInsertOptions } from './useEmojiInsert.types';

/**
 * Hook for inserting emojis into an input or textarea at the cursor position.
 * Handles cursor positioning after insertion using requestAnimationFrame for reliability.
 *
 * @param options - Configuration object containing inputRef, value, and onChange callback
 * @returns Function to handle emoji selection
 *
 * @example
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 * const [value, setValue] = useState('');
 *
 * const handleEmojiSelect = useEmojiInsert({
 *   inputRef,
 *   value,
 *   onChange: setValue,
 * });
 *
 * <EmojiPicker onEmojiSelect={handleEmojiSelect} />
 * ```
 */
export function useEmojiInsert({ inputRef, value, onChange }: UseEmojiInsertOptions) {
  return useCallback(
    (emoji: { native: string }) => {
      const input = inputRef.current;
      if (!input) return;

      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const newValue = value.slice(0, start) + emoji.native + value.slice(end);

      onChange(newValue);

      // Use requestAnimationFrame to ensure the state update completes before focusing
      requestAnimationFrame(() => {
        // Check if input still exists (component might have unmounted)
        if (input && inputRef.current === input) {
          input.focus();
          const newCursorPos = start + emoji.native.length;
          input.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    },
    [inputRef, value, onChange],
  );
}
