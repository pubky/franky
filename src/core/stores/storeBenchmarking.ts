import type { StateCreator, StoreApi } from 'zustand';

import { benchmarkNow, isBenchmarkingEnabled } from '../../../benchmarks/config';
import { recordCounter, recordTiming } from '../../../benchmarks/reporters/jsonReporter';

export interface StoreBenchmarkMetrics {
  store: string;
  actionCount: number;
  renderCount: number;
  lastAction?: string;
  actions: Array<{ name: string; duration: number; timestamp: string }>;
}

const registry = new Map<string, StoreBenchmarkMetrics>();
const subscribers = new Map<string, Set<() => void>>();

const createInitialMetrics = (store: string): StoreBenchmarkMetrics => ({
  store,
  actionCount: 0,
  renderCount: 0,
  actions: [],
});

const getMetrics = (store: string): StoreBenchmarkMetrics => {
  if (!registry.has(store)) {
    registry.set(store, createInitialMetrics(store));
  }
  return registry.get(store)!;
};

const notify = (store: string) => {
  const listeners = subscribers.get(store);
  if (!listeners) return;
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('[benchmarks] store listener failed', error);
    }
  });
};

const cloneMetrics = (metrics: StoreBenchmarkMetrics | undefined) => {
  if (!metrics) return undefined;
  return {
    ...metrics,
    actions: metrics.actions.map((action) => ({ ...action })),
  };
};

const shouldInstrument = () => isBenchmarkingEnabled();

export const withStoreBenchmarking = <T extends object>(storeName: string) => {
  return (initializer: StateCreator<T>): StateCreator<T> => {
    if (!shouldInstrument()) {
      return initializer;
    }

    return (set, get, api) => {
      const metrics = getMetrics(storeName);

      const instrumentedSet: StoreApi<T>['setState'] = (partial, replace, actionName) => {
        const label = typeof actionName === 'string' ? actionName : 'setState';
        const start = benchmarkNow();
        const result = set(partial, replace, actionName);
        const duration = benchmarkNow() - start;

        metrics.actionCount += 1;
        metrics.lastAction = label;
        metrics.actions.push({ name: label, duration, timestamp: new Date().toISOString() });

        recordTiming('zustand', `${storeName}.${label}`, duration, {
          store: storeName,
          action: label,
        });
        recordCounter('zustand', `${storeName}.actions`, metrics.actionCount, {
          store: storeName,
        });

        notify(storeName);
        return result;
      };

      const originalSubscribe = api.subscribe.bind(api);

      api.subscribe = ((listener: any, selector?: any, equalityFn?: any) => {
        const wrappedListener = (state: any, previous: any) => {
          metrics.renderCount += 1;
          recordCounter('zustand', `${storeName}.renders`, metrics.renderCount, { store: storeName });
          notify(storeName);
          return listener(state, previous);
        };
        return originalSubscribe(wrappedListener, selector, equalityFn);
      }) as typeof api.subscribe;

      return initializer(instrumentedSet, get, api);
    };
  };
};

export const getStoreBenchmarkSnapshot = (store: string) => cloneMetrics(registry.get(store));

export const resetStoreBenchmarkMetrics = (store?: string) => {
  if (store) {
    registry.set(store, createInitialMetrics(store));
    notify(store);
    return;
  }

  registry.clear();
  subscribers.clear();
};

export const subscribeToStoreBenchmarkMetrics = (store: string, listener: () => void) => {
  if (!subscribers.has(store)) {
    subscribers.set(store, new Set());
  }
  const storeListeners = subscribers.get(store)!;
  storeListeners.add(listener);

  return () => {
    storeListeners.delete(listener);
    if (storeListeners.size === 0) {
      subscribers.delete(store);
    }
  };
};

export const isStoreBenchmarkingEnabled = shouldInstrument;
