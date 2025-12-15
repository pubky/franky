'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface UseStickyWhenFitsOptions {
  /**
   * Offset from top of viewport (e.g., header height)
   * Should match the CSS variable for header height:
   * - Profile pages: 146px (--header-height)
   * - Main content areas: 150px (--header-offset-main)
   * Default: 150px
   */
  topOffset?: number;
  /**
   * Extra padding/margin to account for at bottom
   * Default: 48px (pb-12 = 3rem = 48px)
   */
  bottomOffset?: number;
  /**
   * Debounce delay in milliseconds
   * Default: 100ms
   */
  debounceMs?: number;
}

/**
 * Hook to determine if an element should be sticky based on whether
 * it fits within the available viewport height.
 *
 * The element will only be sticky if its height is less than or equal
 * to the available viewport height (viewport - topOffset - bottomOffset).
 *
 * @param options - Configuration options
 * @returns Object with ref to attach to element and shouldBeSticky boolean
 *
 * @example
 * ```tsx
 * function Sidebar({ children }) {
 *   const { ref, shouldBeSticky } = useStickyWhenFits({ topOffset: 100 });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={shouldBeSticky ? 'sticky top-[100px]' : ''}
 *     >
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStickyWhenFits(options: UseStickyWhenFitsOptions = {}) {
  const { topOffset = 150, bottomOffset = 48, debounceMs = 100 } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [shouldBeSticky, setShouldBeSticky] = useState(true);

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

  return { ref, shouldBeSticky };
}
