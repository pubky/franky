'use client';

import { useEffect } from 'react';
import * as Core from '@/core';

/**
 * Hook to reset layout to COLUMNS mode on component mount
 * Useful for pages that don't support WIDE layout mode
 */
export function useLayoutReset(): void {
  const { setLayout } = Core.useHomeStore();

  useEffect(() => {
    setLayout(Core.LAYOUT.COLUMNS);
  }, [setLayout]);
}
