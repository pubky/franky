import type { AppErrorType } from '../error';

/**
 * Configuration for retry delays with exponential backoff.
 */
export type RetryDelayConfig = {
  /** Initial delay in milliseconds before first retry */
  initial: number;
  /** Maximum delay in milliseconds (caps exponential growth) */
  max: number;
};

/**
 * Configuration for retry behavior.
 *
 * Defines which errors should retry, how many times, and with what delays.
 */
export type RetryConfig = {
  /** Error types that should NEVER retry (permanent failures) */
  nonRetryableErrorTypes: AppErrorType[];

  /**
   * Retry limits by status code category.
   * Set to 0 to disable retries for that category.
   */
  retryLimits: {
    /** 404 responses - e.g., Nexus uses 5 due to indexing delay */
    notFound?: number;
    /** 5xx responses */
    serverError?: number;
    /** 429 responses - falls back to serverError if not specified */
    rateLimited?: number;
    /** Default for unmatched cases */
    default: number;
  };

  /**
   * Retry delay configuration with exponential backoff.
   * Formula: min(initial * 2^attemptIndex, max)
   */
  retryDelays: {
    /** Delays for 404 responses */
    notFound?: RetryDelayConfig;
    /** Delays for 5xx responses */
    serverError?: RetryDelayConfig;
    /** Default delays for unmatched cases */
    default: RetryDelayConfig;
  };
};

/**
 * Configuration for creating a QueryClient with retry behavior.
 */
export type QueryClientConfig = {
  /** Retry configuration */
  retry: RetryConfig;
  /**
   * How long data is considered fresh (won't refetch).
   * @default 0 (always fetch fresh)
   */
  staleTime?: number;
  /**
   * How long inactive data stays in cache before garbage collection.
   * @default 1800000 (30 minutes)
   */
  gcTime?: number;
};
