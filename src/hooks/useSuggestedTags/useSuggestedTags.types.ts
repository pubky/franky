export interface UseSuggestedTagsOptions {
  /** Current tag input value */
  tagInput: string;
  /** Callback when a tag is selected from suggestions */
  onTagSelect?: (tag: string) => void;
  /** Debounce delay in ms (default: 500) */
  debounceMs?: number;
  /** Max number of suggestions to show (default: 5) */
  limit?: number;
}

export interface UseSuggestedTagsResult {
  /** Array of suggested tag labels */
  suggestedTags: string[];
  /** Currently selected suggestion index (null if none) */
  selectedIndex: number | null;
  /** Whether search is in progress */
  isSearching: boolean;
  /** Keyboard handler for arrow navigation and selection (from useListboxNavigation) */
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
  /** Click handler for selecting a tag */
  handleTagClick: (tag: string) => void;
  /** Clear suggestions */
  clearSuggestions: () => void;
}
