import { RefObject } from 'react';

export interface UseTagInputOptions {
  /** Callback when a tag is added */
  onTagAdd: (tag: string) => void;
  /** Existing tags for duplicate checking */
  existingTags?: string[];
  /** Maximum number of tags allowed (optional) */
  maxTags?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
}

export interface UseTagInputReturn {
  /** Current input value */
  inputValue: string;
  /** Set input value */
  setInputValue: (value: string) => void;
  /** Whether emoji picker is open */
  showEmojiPicker: boolean;
  /** Set emoji picker visibility */
  setShowEmojiPicker: (show: boolean) => void;
  /** Whether tag limit is reached */
  isAtLimit: boolean;
  /** Whether limit was just reached (for showing message) */
  limitReached: boolean;
  /** Ref to attach to input element */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Handle input change */
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handle tag submission */
  handleTagSubmit: () => void;
  /** Handle emoji selection */
  handleEmojiSelect: (emoji: { native: string }) => void;
  /** Clear the input */
  clearInput: () => void;
  /** Whether input is disabled (from prop or limit) */
  isDisabled: boolean;
}
