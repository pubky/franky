'use client';

import { useSyncExternalStore } from 'react';

import {
  getStoreBenchmarkSnapshot,
  isStoreBenchmarkingEnabled,
  subscribeToStoreBenchmarkMetrics,
  type StoreBenchmarkMetrics,
} from '@/core/stores/storeBenchmarking';

const noopUnsubscribe = () => () => {};
const readDisabledState = (): StoreBenchmarkMetrics | undefined => undefined;

export const useStoreBenchmarkMetrics = (storeName: string) => {
  const subscribe = isStoreBenchmarkingEnabled()
    ? (callback: () => void) => subscribeToStoreBenchmarkMetrics(storeName, callback)
    : noopUnsubscribe;

  const getSnapshot = isStoreBenchmarkingEnabled() ? () => getStoreBenchmarkSnapshot(storeName) : readDisabledState;

  return useSyncExternalStore(subscribe, getSnapshot, readDisabledState);
};
