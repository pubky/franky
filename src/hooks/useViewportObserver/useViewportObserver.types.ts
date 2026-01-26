/**
 * Types for useViewportObserver hook
 *
 * A pure IntersectionObserver wrapper with no business logic.
 * Use this as a building block for higher-level viewport-aware hooks.
 */

/**
 * Configuration options for the viewport observer hook
 */
export interface UseViewportObserverOptions {
  /**
   * Root margin for IntersectionObserver
   * Positive values expand the viewport detection area
   * @default '200px 0px 200px 0px'
   */
  rootMargin?: string;

  /**
   * Intersection threshold (0-1)
   * 0 = trigger when any part is visible
   * 1 = trigger when fully visible
   * @default 0
   */
  threshold?: number;

  /**
   * Whether viewport observation is enabled
   * When false, isVisible will always be false
   * @default true
   */
  enabled?: boolean;
}

/**
 * Result returned by useViewportObserver
 */
export interface UseViewportObserverResult {
  /**
   * Callback ref to attach to the element to observe
   * Use this ref on the container element
   */
  ref: (node: HTMLElement | null) => void;

  /**
   * Whether the element is currently visible in the viewport
   */
  isVisible: boolean;
}
