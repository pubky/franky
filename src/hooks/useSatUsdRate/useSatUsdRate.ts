'use client';

import { useEffect, useState } from 'react';

import { BtcRate, getSatoshiUsdRate } from '@/libs/exchangerate/exchangerate';

/**
 * Module-level cache for the SAT/USD rate.
 * This ensures the rate is only fetched once across all hook instances.
 */
let cachedRate: BtcRate | null = null;
let cachePromise: Promise<BtcRate> | null = null;

/**
 * The maximum age of the cached rate.
 */
const MAX_CACHE_AGE = 1000 * 60 * 30; // 30 minutes

/**
 * Fetches the SAT/USD rate with caching.
 * Multiple concurrent calls will share the same promise.
 */
async function getCachedSatoshiUsdRate(): Promise<BtcRate> {
  // Invalidate cache if it's older than the maximum cache age
  const isCacheOutdated = cachedRate && cachedRate.lastUpdatedAt.getTime() + MAX_CACHE_AGE < Date.now();
  if (isCacheOutdated) {
    cachedRate = null;
  }

  // Return cached value if available
  if (cachedRate !== null) {
    return cachedRate;
  }

  // Return existing promise if a fetch is already in progress
  if (cachePromise !== null) {
    return cachePromise;
  }

  // Create new fetch promise
  cachePromise = getSatoshiUsdRate()
    .then((rate) => {
      cachedRate = rate;
      return cachedRate;
    })
    .finally(() => {
      // Clear the promise so we can fetch again if needed
      cachePromise = null;
    });

  return cachePromise;
}

/**
 * Fetch the current SAT/USD exchange rate.
 * This rate is cached for 30 minutes.
 *
 * @returns The current SAT/USD rate, or null if the rate is not available
 *
 * @example
 * ```tsx
 * const rate = useBtcRate();
 * if (rate === null) return <div>Rate not available</div>;
 *
 * const sats = 1000;
 * const usd = sats * rate.satUsd;
 * return <div>{sats} SAT = ${usd}</div>;
 * ```
 */
export function useBtcRate(): BtcRate | null {
  const [rate, setRate] = useState<BtcRate | null>(() => {
    return null;
  });

  async function fetchRate() {
    try {
      const rate = await getCachedSatoshiUsdRate();
      setRate(rate);
    } catch {
      setRate(null);
    }
  }

  useEffect(() => {
    const isSSR = typeof window === 'undefined';
    if (!isSSR) {
      // Avoid fetching on server to avoid hydration errors.
      // Only fetch once when boostraping the app. In the future, we may fetch more frequently.
      fetchRate();
    }
  }, []);

  return rate;
}
