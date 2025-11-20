'use client';

import { useLayoutEffect, useRef } from 'react';

export function useBodyScrollLock(locked: boolean) {
  const originalOverflowRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    if (locked && originalOverflowRef.current === null) {
      // Capture original overflow on first lock
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else if (!locked && originalOverflowRef.current !== null) {
      // Restore original overflow on unlock
      document.body.style.overflow = originalOverflowRef.current;
      originalOverflowRef.current = null;
    }

    return () => {
      // Only restore on unmount if currently locked
      if (originalOverflowRef.current !== null) {
        document.body.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = null;
      }
    };
  }, [locked]);
}
