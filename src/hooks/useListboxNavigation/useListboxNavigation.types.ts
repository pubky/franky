export interface UseListboxNavigationParams<T> {
  /** Array of items to navigate through */
  items: T[];
  /** Whether the listbox is currently open/visible */
  isOpen: boolean;
  /** Callback when an item is selected (Enter key) */
  onSelect?: (item: T, index: number) => void;
  /** Callback to close the listbox */
  onClose?: () => void;
}

export interface UseListboxNavigationResult {
  /** Currently selected index, null if none selected */
  selectedIndex: number | null;
  /** Set the selected index manually (e.g., on hover) */
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  /**
   * Keyboard event handler for listbox navigation.
   * Returns true if the event was handled, false otherwise.
   * Handles: ArrowDown, ArrowUp, Enter, Escape, Tab
   */
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
  /** Reset selection to null */
  resetSelection: () => void;
}
