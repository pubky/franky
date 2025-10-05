'use client';

import { useRef, useEffect, useState } from 'react';

export function useElementHeight() {
  const [height, setHeight] = useState(100);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const updateHeight = () => {
      if (ref.current) {
        const height = ref.current.getBoundingClientRect().height;
        setHeight(height);
      }
    };

    // Initial height
    updateHeight();

    // Use ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { ref, height };
}
