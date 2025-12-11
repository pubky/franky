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
