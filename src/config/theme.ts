/**
 * Theme Configuration
 *
 * Centralized theme constants that match Tailwind CSS v4 breakpoints
 * These values should be kept in sync with any Tailwind customizations
 *
 * @see https://tailwindcss.com/docs/breakpoints
 */

/**
 * Tailwind CSS v4 default breakpoints in pixels
 * Used for responsive design and media query hooks
 */
export const BREAKPOINTS = {
  /** Mobile landscape: 640px and up */
  sm: 640,
  /** Tablets: 768px and up */
  md: 768,
  /** Desktop: 1024px and up */
  lg: 1024,
  /** Large desktop: 1280px and up */
  xl: 1280,
  /** Extra large desktop: 1536px and up */
  '2xl': 1536,
} as const;

/**
 * Breakpoint names available in the theme
 */
export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Helper function to get breakpoint value
 * @param breakpoint - The breakpoint name
 * @returns The breakpoint value in pixels
 */
export function getBreakpoint(breakpoint: Breakpoint): number {
  return BREAKPOINTS[breakpoint];
}
