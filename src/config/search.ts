/**
 * Maximum height for search suggestions dropdown
 * - Prevents dropdown from taking up entire screen on mobile
 * - Enables scrolling when content exceeds this height
 * - Applied consistently across all device sizes
 */
const SEARCH_SUGGESTIONS_MAX_HEIGHT = 300;

/**
 * Shared style for search expanded state and dropdown
 * Matches header gradient with backdrop blur
 */
export const SEARCH_EXPANDED_STYLE = {
  background: 'linear-gradient(180deg, #05050A 0%, rgba(5, 5, 10, 0.50) 100%)',
  backdropFilter: 'blur(12px)',
  maxHeight: `${SEARCH_SUGGESTIONS_MAX_HEIGHT}px`,
} as const;
