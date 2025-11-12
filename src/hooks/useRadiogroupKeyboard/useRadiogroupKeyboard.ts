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

/**
 * Custom hook for implementing keyboard navigation in a radiogroup following WAI-ARIA patterns
 *
 * @description
 * Implements the WAI-ARIA radiogroup keyboard interaction pattern:
 * - Arrow Up/Down or Left/Right: Navigate between options
 * - Space/Enter: Select the focused option
 * - Home: Jump to first option
 * - End: Jump to last option
 *
 * @example
 * ```tsx
 * const items = ['option1', 'option2', 'option3'];
 * const { listRef, handleKeyDown } = useRadiogroupKeyboard({
 *   items,
 *   onSelect: (item) => setSelected(item),
 * });
 *
 * return (
 *   <div ref={listRef} role="radiogroup">
 *     {items.map((item, index) => (
 *       <button
 *         key={item}
 *         role="radio"
 *         onKeyDown={(e) => handleKeyDown(e, index)}
 *       >
 *         {item}
 *       </button>
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @param options - Configuration options for the keyboard navigation
 * @returns Object containing listRef and handleKeyDown handler
 */
export function useRadiogroupKeyboard<T>({
  items,
  onSelect,
  isDisabled,
}: UseRadiogroupKeyboardOptions<T>): UseRadiogroupKeyboardReturn {
  const listRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          // Find next non-disabled item
          nextIndex = currentIndex;
          do {
            nextIndex = (nextIndex + 1) % items.length;
          } while (isDisabled?.(items[nextIndex], nextIndex) && nextIndex !== currentIndex);
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          // Find previous non-disabled item
          nextIndex = currentIndex;
          do {
            nextIndex = nextIndex === 0 ? items.length - 1 : nextIndex - 1;
          } while (isDisabled?.(items[nextIndex], nextIndex) && nextIndex !== currentIndex);
          break;

        case 'Home':
          event.preventDefault();
          // Find first non-disabled item
          nextIndex = 0;
          while (isDisabled?.(items[nextIndex], nextIndex) && nextIndex < items.length - 1) {
            nextIndex++;
          }
          break;

        case 'End':
          event.preventDefault();
          // Find last non-disabled item
          nextIndex = items.length - 1;
          while (isDisabled?.(items[nextIndex], nextIndex) && nextIndex > 0) {
            nextIndex--;
          }
          break;

        case ' ':
        case 'Enter':
          event.preventDefault();
          // Select current item if not disabled
          if (!isDisabled?.(items[currentIndex], currentIndex)) {
            onSelect(items[currentIndex], currentIndex);
          }
          return;

        default:
          return;
      }

      // Focus the next item
      const radioItems = listRef.current?.querySelectorAll('[role="radio"]');
      if (radioItems && radioItems[nextIndex]) {
        (radioItems[nextIndex] as HTMLElement).focus();
      }
    },
    [items, onSelect, isDisabled],
  );

  return { listRef, handleKeyDown };
}
