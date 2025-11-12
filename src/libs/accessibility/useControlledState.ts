import * as React from 'react';

/**
 * Options for the useControlledState hook
 */
export interface UseControlledStateOptions<T> {
  /**
   * Controlled value (if provided, component is in controlled mode)
   */
  value?: T;
  /**
   * Default value for uncontrolled mode
   */
  defaultValue: T;
  /**
   * Callback fired when value changes
   */
  onChange?: (value: T) => void;
}

/**
 * Return type for the useControlledState hook
 */
export interface UseControlledStateReturn<T> {
  /**
   * Current value (either controlled or internal state)
   */
  value: T;
  /**
   * Function to update the value
   */
  setValue: (value: T) => void;
  /**
   * Whether the component is in controlled mode
   */
  isControlled: boolean;
}

/**
 * Custom hook for managing controlled and uncontrolled state patterns
 *
 * @description
 * Implements the controlled/uncontrolled component pattern commonly used in React.
 * When a `value` prop is provided, the component operates in controlled mode.
 * When only `defaultValue` is provided, the component manages its own internal state.
 *
 * This pattern follows React best practices and is similar to how native HTML inputs work.
 *
 * @example
 * ```tsx
 * // Controlled mode
 * function ControlledExample() {
 *   const [value, setValue] = useState('option1');
 *   const state = useControlledState({
 *     value,
 *     defaultValue: 'option1',
 *     onChange: setValue,
 *   });
 *   return <Component value={state.value} onChange={state.setValue} />;
 * }
 *
 * // Uncontrolled mode
 * function UncontrolledExample() {
 *   const state = useControlledState({
 *     defaultValue: 'option1',
 *     onChange: (val) => console.log('Changed to:', val),
 *   });
 *   return <Component value={state.value} onChange={state.setValue} />;
 * }
 * ```
 *
 * @param options - Configuration options
 * @returns Object containing the current value, setter, and controlled state flag
 */
export function useControlledState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControlledStateOptions<T>): UseControlledStateReturn<T> {
  const [internalValue, setInternalValue] = React.useState<T>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = React.useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  return { value, setValue, isControlled };
}
