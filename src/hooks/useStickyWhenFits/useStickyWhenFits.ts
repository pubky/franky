'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { LAYOUT } from '@/config';

interface UseStickyWhenFitsOptions {
  /**
   * Offset from top of viewport (e.g., header height)
   * Should match the CSS variable for header height:
   * - Profile pages: LAYOUT.HEADER_HEIGHT_PROFILE (146px, --header-height)
   * - Main content areas: LAYOUT.HEADER_OFFSET_MAIN (150px, --header-offset-main)
   * Default: LAYOUT.HEADER_OFFSET_MAIN (150px)
   */
  topOffset?: number;
  /**
   * Extra padding/margin to account for at bottom
   * Default: LAYOUT.SIDEBAR_BOTTOM_OFFSET (48px, pb-12 = 3rem)
   */
  bottomOffset?: number;
  /**
   * Debounce delay in milliseconds
   * Default: 100ms
   */
  debounceMs?: number;
}

interface UseStickyWhenFitsResult {
  /** Ref to attach to the element */
  ref: React.RefObject<HTMLDivElement | null>;
  /**
   * Whether the element should be sticky.
   * - `undefined`: Not yet calculated (SSR or before first client render)
   * - `true`: Element fits in viewport, should be sticky
   * - `false`: Element is too tall, should not be sticky
   *
   * For backwards compatibility, use `shouldBeSticky !== false` to treat
   * undefined as sticky (optimistic assumption during SSR).
   */
  shouldBeSticky: boolean | undefined;
  /** Whether the sticky calculation has been performed (client-side only) */
  isReady: boolean;
}

/**
 * Hook to determine if an element should be sticky based on whether
 * it fits within the available viewport height.
 *
 * The element will only be sticky if its height is less than or equal
 * to the available viewport height (viewport - topOffset - bottomOffset).
 *
 * ## SSR Behavior
 * - `shouldBeSticky` starts as `undefined` during SSR and initial hydration
 * - After the first client-side render, it's calculated and set to a boolean
 * - Use `isReady` to check if the calculation has been performed
 * - Use `shouldBeSticky !== false` for optimistic sticky behavior during SSR
 *
 * @param options - Configuration options
 * @returns Object with ref, shouldBeSticky state, and isReady flag
 *
 * @example
 * ```tsx
 * function Sidebar({ children }) {
 *   const { ref, shouldBeSticky } = useStickyWhenFits({ topOffset: 100 });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       // Use !== false to treat undefined (SSR) as sticky
 *       className={shouldBeSticky !== false ? 'sticky top-[100px]' : ''}
 *     >
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStickyWhenFits(options: UseStickyWhenFitsOptions = {}): UseStickyWhenFitsResult {
  const {
    topOffset = LAYOUT.HEADER_OFFSET_MAIN,
    bottomOffset = LAYOUT.SIDEBAR_BOTTOM_OFFSET,
    debounceMs = 100,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  // Start with undefined to avoid SSR hydration mismatch
  // The value is only calculated client-side after the component mounts
  const [shouldBeSticky, setShouldBeSticky] = useState<boolean | undefined>(undefined);

  const checkIfFits = useCallback(() => {
    if (!ref.current) return;

    const elementHeight = ref.current.getBoundingClientRect().height;
    const viewportHeight = window.innerHeight;
    const availableHeight = viewportHeight - topOffset - bottomOffset;

    setShouldBeSticky(elementHeight <= availableHeight);
  }, [topOffset, bottomOffset]);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;

    let timeoutId: NodeJS.Timeout;

    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIfFits, debounceMs);
    };

    // Initial check
    checkIfFits();

    // Listen to window resize
    window.addEventListener('resize', debouncedCheck);

    // Use ResizeObserver to watch for content size changes
    const resizeObserver = new ResizeObserver(() => {
      debouncedCheck();
    });
    resizeObserver.observe(ref.current);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheck);
      resizeObserver.disconnect();
    };
  }, [checkIfFits, debounceMs]);

  return {
    ref,
    shouldBeSticky,
    isReady: shouldBeSticky !== undefined,
  };
}
