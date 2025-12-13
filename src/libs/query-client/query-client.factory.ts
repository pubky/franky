import { QueryClient } from '@tanstack/react-query';
import { isAppError } from '../error';
import type { QueryClientConfig } from './query-client.types';

/**
 * Creates a TanStack QueryClient with configurable retry behavior.
 *
 * Each service can define its own retry strategy:
 * - Which error types are non-retryable (permanent failures)
 * - Retry limits per status code category
 * - Exponential backoff delays
 *
 * @example
 * ```typescript
 * const nexusQueryClient = createQueryClient({
 *   retry: {
 *     nonRetryableErrorTypes: [NexusErrorType.INVALID_REQUEST],
 *     retryLimits: { notFound: 5, serverError: 3, default: 3 },
 *     retryDelays: {
 *       notFound: { initial: 500, max: 10_000 },
 *       default: { initial: 1_000, max: 30_000 },
 *     },
 *   },
 * });
 * ```
 *
 * @param config - Configuration for retry behavior, stale time, and cache time
 * @returns A configured QueryClient instance
 */
export function createQueryClient(config: QueryClientConfig): QueryClient {
  const { retry, staleTime = 0, gcTime = 30 * 60 * 1000 } = config;

  /**
   * Determines if an error should be retried based on configuration.
   */
  function shouldRetry(failureCount: number, error: unknown): boolean {
    if (!isAppError(error)) {
      return failureCount < retry.retryLimits.default;
    }

    const { statusCode, type } = error;

    // Permanent failures - don't retry
    if (retry.nonRetryableErrorTypes.includes(type)) {
      return false;
    }

    // Status code based retry logic
    if (statusCode === 404) {
      return failureCount < (retry.retryLimits.notFound ?? 0);
    }

    if (statusCode === 429) {
      return failureCount < (retry.retryLimits.rateLimited ?? retry.retryLimits.serverError ?? 0);
    }

    if (statusCode >= 500) {
      return failureCount < (retry.retryLimits.serverError ?? retry.retryLimits.default);
    }

    // Other 4xx: Client errors - don't retry
    if (statusCode >= 400) {
      return false;
    }

    return failureCount < retry.retryLimits.default;
  }

  /**
   * Calculates retry delay with exponential backoff.
   * Formula: min(initial * 2^attemptIndex, max)
   */
  function retryDelay(attemptIndex: number, error: unknown): number {
    const delays = retry.retryDelays;

    if (isAppError(error)) {
      // 404: Use notFound delays if configured
      if (error.statusCode === 404 && delays.notFound) {
        return Math.min(delays.notFound.initial * 2 ** attemptIndex, delays.notFound.max);
      }

      // 5xx: Use serverError delays if configured
      if (error.statusCode >= 500 && delays.serverError) {
        return Math.min(delays.serverError.initial * 2 ** attemptIndex, delays.serverError.max);
      }
    }

    // Default delays
    return Math.min(delays.default.initial * 2 ** attemptIndex, delays.default.max);
  }

  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        retryDelay: retryDelay,
        staleTime,
        gcTime,
      },
    },
  });
}
