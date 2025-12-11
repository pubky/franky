import * as React from 'react';

/**
 * Options for the useRadiogroupKeyboard hook
 */
export interface UseRadiogroupKeyboardOptions<T> {
  /**
   * Array of items in the radiogroup
   */
  items: T[];
  /**
   * Callback fired when an item is selected via keyboard
   */
  onSelect: (item: T, index: number) => void;
  /**
   * Optional filter to disable navigation to certain items
   */
  isDisabled?: (item: T, index: number) => boolean;
}

/**
 * Return type for the useRadiogroupKeyboard hook
 */
export interface UseRadiogroupKeyboardReturn {
  /**
   * Ref to attach to the radiogroup container
   */
  listRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Keyboard event handler to attach to each radio item
   */
  handleKeyDown: (event: React.KeyboardEvent, currentIndex: number) => void;
}
