'use client';

import { useEffect, useState } from 'react';

import { HomegateController, THomegateLnInfoResult, homegateQueryClient } from '@/core';

const QUERY_KEY = ['homegate', 'ln-verification-info'];

/**
 * Fetch the Lightning Network verification availability and price.
 * Uses TanStack Query for caching - the result is cached for 30 minutes.
 * Returns cached data immediately if available, avoiding loading states on navigation.
 *
 * @returns The availability and price info, or null if not loaded yet
 */
export function useLnVerificationInfo(): THomegateLnInfoResult | null {
  // Read cached data synchronously to avoid skeleton flash on navigation
  const cachedData = homegateQueryClient.getQueryData<THomegateLnInfoResult>(QUERY_KEY);
  const [info, setInfo] = useState<THomegateLnInfoResult | null>(cachedData ?? null);

  useEffect(() => {
    let cancelled = false;

    HomegateController.getLnVerificationInfo()
      .then((result) => {
        if (!cancelled) setInfo(result);
      })
      .catch(() => {
        // Treat errors as unavailable to provide clear feedback
        if (!cancelled) setInfo({ available: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return info;
}
