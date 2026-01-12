'use client';

import { useEffect, useState } from 'react';

import { HomegateController, TGetLnVerificationPriceResult } from '@/core';

/**
 * Fetch the current Lightning Network verification price in satoshis.
 * Uses TanStack Query for caching - the price is cached for 30 minutes
 * and only one request is made regardless of how many components use this hook.
 *
 * @returns The price in satoshis, or null if the price is not available yet
 *
 * @example
 * ```tsx
 * const price = useLnVerificationPrice();
 * if (price === null) return <div>Loading price...</div>;
 *
 * return <div>Price: {price.amountSat} sats</div>;
 * ```
 */
export function useLnVerificationPrice(): TGetLnVerificationPriceResult | null {
  const [price, setPrice] = useState<TGetLnVerificationPriceResult | null>(null);

  useEffect(() => {
    const isSSR = typeof window === 'undefined';
    if (isSSR) return;

    HomegateController.getLnVerificationPrice()
      .then(setPrice)
      .catch(() => setPrice(null));
  }, []);

  return price;
}
