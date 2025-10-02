'use client';

import { useState, useEffect } from 'react';

// Hook to detect touch devices
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const win = typeof window !== 'undefined' ? window : global;
      const nav = typeof navigator !== 'undefined' ? navigator : global.navigator;

      const hasOntouchstart = 'ontouchstart' in win && win.ontouchstart !== undefined;
      const hasMaxTouchPoints = nav && nav.maxTouchPoints > 0;
      const hasCoarsePointer = win.matchMedia ? win.matchMedia('(pointer: coarse)').matches : false;

      setIsTouch(hasOntouchstart || hasMaxTouchPoints || hasCoarsePointer);
    };

    checkTouch();
    const win = typeof window !== 'undefined' ? window : global;
    win.addEventListener('resize', checkTouch);
    return () => win.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
}
