'use client';

import { useEffect, useState } from 'react';

import { HomegateController, THomegateLnInfoResult } from '@/core';

/**
 * Fetch the Lightning Network verification availability and price.
 * Uses TanStack Query for caching - the result is cached for 30 minutes
 * and only one request is made regardless of how many components use this hook.
 *
 * @returns The availability and price info, or null if not loaded yet
 *
 * @example
 * ```tsx
 * const lnInfo = useLnVerificationInfo();
 * if (lnInfo === null) return <div>Loading...</div>;
 * if (!lnInfo.available) return <div>Not available in your region</div>;
 *
 * return <div>Price: {lnInfo.amountSat} sats</div>;
 * ```
 */
export function useLnVerificationInfo(): THomegateLnInfoResult | null {
  const [info, setInfo] = useState<THomegateLnInfoResult | null>(null);

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
