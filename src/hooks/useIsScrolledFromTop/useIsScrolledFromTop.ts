'use client';

import { useState, useEffect } from 'react';

/**
 * useIsScrolledFromTop
 *
 * Hook to detect if the user has scrolled away from the top of the page.
 * Useful for showing floating elements like "New Posts" buttons.
 *
 * @param threshold - Number of pixels from top to consider as "scrolled" (default: 100)
 * @returns boolean indicating if the user has scrolled past the threshold
 *
 * @example
 * ```tsx
 * const isScrolled = useIsScrolledFromTop(100);
 *
 * if (isScrolled) {
 *   // Show floating button
 * }
 * ```
 */
export function useIsScrolledFromTop(threshold = 100): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
