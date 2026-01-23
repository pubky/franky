/**
 * Types for useTtlUserViewportSubscription hook
 *
 * This hook manages TTL coordinator subscriptions for users based on viewport visibility.
 */

/**
 * Configuration options for the user viewport subscription hook
 */
export interface UseTtlUserViewportSubscriptionOptions {
  /**
   * User public key to subscribe for TTL tracking
   * If null/undefined, subscription is disabled
   */
  pubky: string | null | undefined;

  /**
   * Root margin for IntersectionObserver
   * Positive values expand the viewport detection area
   * @default '200px 0px 200px 0px'
   */
  rootMargin?: string;

  /**
   * Intersection threshold (0-1)
   * 0 = trigger when any part is visible
   * @default 0
   */
  threshold?: number;
}

/**
 * Result returned by useTtlUserViewportSubscription
 */
export interface UseTtlUserViewportSubscriptionResult {
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
