'use client';

import { useLayoutEffect } from 'react';

export function useBodyScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const originalOverflow = document.body.style.overflow;

    if (locked) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [locked]);
}
