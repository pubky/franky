import { benchmarkNow, isBenchmarkingEnabled } from './config.ts';
import { recordTiming } from './reporters/jsonReporter.ts';

export type BenchmarkMetadata = Record<string, unknown> | undefined;

type AnyFunction<T> = () => T;

type AsyncFunction<T> = () => Promise<T>;

export const traceSync = <T>(scope: string, name: string, fn: AnyFunction<T>, meta?: BenchmarkMetadata): T => {
  if (!isBenchmarkingEnabled()) {
    return fn();
  }

  const start = benchmarkNow();
  try {
    const value = fn();
    if (value instanceof Promise) {
      throw new Error('traceSync received a Promise. Use traceAsync instead.');
    }
    return value;
  } finally {
    const duration = benchmarkNow() - start;
    recordTiming(scope, name, duration, meta);
  }
};

export const traceAsync = async <T>(
  scope: string,
  name: string,
  fn: AsyncFunction<T>,
  meta?: BenchmarkMetadata,
): Promise<T> => {
  if (!isBenchmarkingEnabled()) {
    return fn();
  }

  const start = benchmarkNow();
  try {
    return await fn();
  } finally {
    const duration = benchmarkNow() - start;
    recordTiming(scope, name, duration, meta);
  }
};

export const wrapPromise = <T>(scope: string, name: string, promise: Promise<T>, meta?: BenchmarkMetadata) => {
  if (!isBenchmarkingEnabled()) {
    return promise;
  }

  const start = benchmarkNow();
  return promise.finally(() => {
    const duration = benchmarkNow() - start;
    recordTiming(scope, name, duration, meta);
  });
};
