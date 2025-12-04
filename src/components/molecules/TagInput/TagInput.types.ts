export interface TagInputProps {
  /** Callback when a tag is added */
  onTagAdd: (
    tag: string,
  ) => void | { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Existing tags for autocomplete suggestions */
  existingTags?: Array<{ label: string }>;
  /** Whether to show the close button (X) */
  showCloseButton?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Hide autocomplete suggestions */
  hideSuggestions?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Maximum number of tags (for limit checking) */
  maxTags?: number;
  /** Current tags count (for limit checking) */
  currentTagsCount?: number;
  /** Custom class for the input placeholder when at limit */
  limitReachedPlaceholder?: string;
  /** Callback when input loses focus */
  onBlur?: () => void;
}
