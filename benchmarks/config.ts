export const BENCHMARK_ENV_FLAG = 'NEXT_PUBLIC_BENCHMARKS';
export const BENCHMARK_RESULTS_DIR = 'benchmarks/results';
export const BENCHMARK_SUMMARY_FILE = 'latest.json';
export const BENCHMARK_MARKDOWN_FILE = 'latest.md';
export const DEFAULT_ITERATIONS = 50;
export const DEFAULT_WARMUP_ITERATIONS = 5;
export const DEFAULT_REGRESSION_THRESHOLD = 0.05;

const BOOLEAN_TRUE_VALUES = new Set(['1', 'true', 'TRUE', 'True']);

const globalFlagKey = '__FRANKY_BENCHMARKS__';

type GlobalWithBenchmarkFlag = typeof globalThis & {
  [globalFlagKey]?: boolean;
};

const globalRef: GlobalWithBenchmarkFlag = globalThis as GlobalWithBenchmarkFlag;

let cachedEnabled: boolean | null = null;

export const isBenchmarkingEnabled = (): boolean => {
  if (cachedEnabled !== null) {
    return cachedEnabled;
  }

  const fromGlobal = globalRef[globalFlagKey];
  if (typeof fromGlobal === 'boolean') {
    cachedEnabled = fromGlobal;
    return cachedEnabled;
  }

  const envValue =
    typeof process !== 'undefined' && process.env ? process.env[BENCHMARK_ENV_FLAG] : undefined;

  if (envValue !== undefined) {
    cachedEnabled = BOOLEAN_TRUE_VALUES.has(envValue);
    return cachedEnabled;
  }

  cachedEnabled = false;
  return cachedEnabled;
};

export const setBenchmarkingEnabled = (value: boolean) => {
  cachedEnabled = value;
  globalRef[globalFlagKey] = value;
};

export const benchmarkNow = (): number => {
  if (typeof globalThis !== 'undefined' && globalThis.performance?.now) {
    return globalThis.performance.now();
  }

  return Date.now();
};

export const benchmarkTimestamp = (): string => new Date().toISOString();
