import { RefObject } from 'react';

export interface UseTagInputOptions {
  /** Callback when a tag is added. Can return Promise for async handling. */
  onTagAdd: (tag: string) => void | Promise<{ success: boolean; error?: string }>;
  /** Viewer's tags for duplicate checking (string labels) */
  existingTags?: string[];
  /** All available tags for suggestions */
  allTags?: Array<{ label: string }>;
}

export interface UseTagInputReturn {
  /** Current input value */
  inputValue: string;
  /** Set input value directly (for programmatic updates) */
  setInputValue: (value: string) => void;
  /** Ref to attach to input element */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Whether emoji picker is open */
  showEmojiPicker: boolean;
  /** Set emoji picker visibility */
  setShowEmojiPicker: (show: boolean) => void;
  /** Whether suggestions dropdown is visible */
  showSuggestions: boolean;
  /** Set suggestions visibility */
  setShowSuggestions: (show: boolean) => void;
  /** Filtered suggestions based on input */
  suggestions: Array<{ label: string }>;
  /** Currently selected suggestion index (-1 or null if none) */
  selectedSuggestionIndex: number | null;
  /** Set selected suggestion index (for mouse hover) */
  setSelectedSuggestionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  /** Handle input change with sanitization */
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handle input focus */
  handleInputFocus: () => void;
  /** Handle keyboard events (arrows, enter, escape) */
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Handle tag submission */
  handleTagSubmit: () => void;
  /** Handle emoji selection */
  handleEmojiSelect: (emoji: { native: string }) => void;
  /** Handle paste event */
  handlePaste: (e: React.ClipboardEvent) => void;
}
