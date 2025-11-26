export interface StatusPickerWrapperProps {
  emoji: string;
  status: string;
  onStatusChange?: (status: string) => void;
  /**
   * Vertical offset for popover positioning relative to trigger.
   * Negative values create overlap with the trigger element.
   * @default -30
   */
  sideOffset?: number;
}
