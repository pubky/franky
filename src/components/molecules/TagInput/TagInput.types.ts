/**
 * Props for the TagInput component.
 *
 * The component supports ref forwarding to the underlying input element
 * for external focus management.
 */
export interface TagInputProps {
  /** Callback when a tag is added. Can return a Promise for async handling. */
  onTagAdd: (tag: string) => void | Promise<{ success: boolean; error?: string }>;
  /** Placeholder text for the input. @default 'add tag' */
  placeholder?: string;
  /** Existing tags for autocomplete suggestions. @default [] */
  existingTags?: Array<{ label: string }>;
  /** Whether to show the close button (X). @default false */
  showCloseButton?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Hide autocomplete suggestions. @default false */
  hideSuggestions?: boolean;
  /** Whether the input is disabled. @default false */
  disabled?: boolean;
  /** Maximum number of tags (for limit checking) */
  maxTags?: number;
  /** Current tags count (for limit checking). @default 0 */
  currentTagsCount?: number;
  /** Placeholder text when tag limit is reached. @default 'limit reached' */
  limitReachedPlaceholder?: string;
  /** Callback when input loses focus (only fires if input is empty) */
  onBlur?: () => void;
  /** Callback when the input container is clicked (useful for auth prompts) */
  onClick?: (e: React.MouseEvent) => void;
  /** Auto-focus the input on mount. @default false */
  autoFocus?: boolean;
  /** Additional className for the container */
  className?: string;
}
