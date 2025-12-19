import type { RefObject } from 'react';

export type InputElement = HTMLInputElement | HTMLTextAreaElement;

export interface UseEmojiInsertOptions {
  /** Ref to the input or textarea element */
  inputRef: RefObject<InputElement | null>;
  /** Current value of the input */
  value: string;
  /** Callback to update the value */
  onChange: (newValue: string) => void;
}
