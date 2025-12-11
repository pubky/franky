'use client';

import { useLayoutEffect, useRef } from 'react';

export function useBodyScrollLock(locked: boolean): void {
  const originalOverflowRef = useRef<string | null>(null);

  // Handle lock/unlock logic
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    if (locked) {
      // Only capture once per lock cycle
      if (originalOverflowRef.current === null) {
        originalOverflowRef.current = document.body.style.overflow;
      }
      document.body.style.overflow = 'hidden';
    } else {
      // Restore when unlocked
      if (originalOverflowRef.current !== null) {
        document.body.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = null;
      }
    }
  }, [locked]);

  // Separate cleanup effect for unmount only
  useLayoutEffect(() => {
    return () => {
      if (originalOverflowRef.current !== null) {
        document.body.style.overflow = originalOverflowRef.current;
      }
    };
  }, []);
}
