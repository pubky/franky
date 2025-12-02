'use client';

import { useEffect, useState } from 'react';

import { getSatoshiUsdRate } from '@/libs/exchangerate/exchangerate';

interface StoredRate {
  /**
   * Whether the rate is still loading
   */
  isLoading: boolean;
  /**
   * The stored rate. When loading, this is null.
   */
  rate: {
    /**
     * The current SAT/USD rate
     */
    satUsd: number;
    /**
     * The timestamp of the last update
     */
    lastUpdatedAt: number;
  } | null;
}

/**
 * Fetch the current SAT/USD exchange rate
 *
 * @returns boolean indicating if the current viewport is below the breakpoint
 *
 * @example
 * ```tsx
 * const {isLoading, rate} = useSatUsdRate();
 * if (isLoading) return <div>Loading...</div>;
 *
 * const sats = 1000;
 * const usd = sats * rate.satUsd;
 * return <div>{sats} SAT = ${usd}</div>;
 * ```
 */
export function useSatUsdRate(): StoredRate {
  const [rate, setRate] = useState(() => {
    return { isLoading: true, rate: null } as StoredRate;
  });

  async function fetchRate() {
    try {
      const rate = await getSatoshiUsdRate();
      setRate({ isLoading: false, rate: { satUsd: rate, lastUpdatedAt: Date.now() } });
    } catch (error) {
      console.error('Failed to fetch SAT/USD rate:', error);
      setRate({ isLoading: false, rate: { satUsd: 0, lastUpdatedAt: 0 } });
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
