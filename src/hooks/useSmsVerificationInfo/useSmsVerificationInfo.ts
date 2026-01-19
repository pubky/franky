'use client';

import { useEffect, useState } from 'react';

import { HomegateController, THomegateSmsInfoResult, homegateQueryClient } from '@/core';

const QUERY_KEY = ['homegate', 'sms-verification-info'];

/**
 * Fetch the SMS verification availability for the user's region.
 * Uses TanStack Query for caching - the result is cached for 30 minutes.
 * Returns cached data immediately if available, avoiding loading states on navigation.
 *
 * @returns The availability info, or null if not loaded yet
 */
export function useSmsVerificationInfo(): THomegateSmsInfoResult | null {
  // Read cached data synchronously to avoid skeleton flash on navigation
  const cachedData = homegateQueryClient.getQueryData<THomegateSmsInfoResult>(QUERY_KEY);
  const [info, setInfo] = useState<THomegateSmsInfoResult | null>(cachedData ?? null);

  useEffect(() => {
    let cancelled = false;

    HomegateController.getSmsVerificationInfo()
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
