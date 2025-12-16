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
      return failureCount < retry.limits.default;
    }

    const { statusCode, type } = error;

    // Permanent failures - don't retry
    if (retry.nonRetryable.includes(type)) {
      return false;
    }

    // Status code based retry logic
    if (statusCode === 404) {
      return failureCount < (retry.limits.notFound ?? retry.limits.default);
    }

    if (statusCode === 429) {
      return failureCount < (retry.limits.rateLimited ?? retry.limits.serverError ?? retry.limits.default);
    }

    if (statusCode >= 500) {
      return failureCount < (retry.limits.serverError ?? retry.limits.default);
    }

    // Other 4xx: Client errors - don't retry
    if (statusCode >= 400) {
      return false;
    }

    return failureCount < retry.limits.default;
  }

  /**
   * Calculates retry delay with exponential backoff.
   * Formula: min(initial * 2^attemptIndex, max)
   */
  function retryDelay(attemptIndex: number, error: unknown): number {
    const delays = retry.delays;

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
