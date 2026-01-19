'use client';

import { useEffect, useState } from 'react';

import { HomegateController, THomegateSmsInfoResult } from '@/core';

/**
 * Fetch the SMS verification availability for the user's region.
 * Uses TanStack Query for caching - the result is cached for 30 minutes
 * and only one request is made regardless of how many components use this hook.
 *
 * @returns The availability info, or null if not loaded yet
 *
 * @example
 * ```tsx
 * const smsInfo = useSmsVerificationInfo();
 * if (smsInfo === null) return <div>Loading...</div>;
 * if (!smsInfo.available) return <div>Not available in your region</div>;
 *
 * return <div>SMS verification available!</div>;
 * ```
 */
export function useSmsVerificationInfo(): THomegateSmsInfoResult | null {
  const [info, setInfo] = useState<THomegateSmsInfoResult | null>(null);

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
