/**
 * Return type for useRelativeTime hook
 */
export interface UseRelativeTimeReturn {
  /**
   * Formats a date as a relative time string (e.g., "2h", "3 days ago")
   */
  formatRelativeTime: (date: Date) => string;
}
