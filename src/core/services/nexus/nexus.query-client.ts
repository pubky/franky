import { QueryClient } from '@tanstack/react-query';
import { isAppError, NexusErrorType } from '@/libs';

/**
 * Nexus API Query Client
 *
 * Provides a configured QueryClient with retry logic for Nexus API errors.
 *
 * Key insight: 404 errors are transient because Nexus indexes content asynchronously,
 * so content that returns 404 may become available shortly after.
 */

// ============================================================================
// Configuration
// ============================================================================

/** Error types that should NOT trigger a retry (permanent failures) */
const NON_RETRYABLE_ERROR_TYPES: NexusErrorType[] = [
  NexusErrorType.INVALID_REQUEST, // 400
  NexusErrorType.VALIDATION_ERROR,
  NexusErrorType.INVALID_RESPONSE,
];

/** Retry limits by error type */
const RETRY_LIMITS = {
  NOT_FOUND: 5, // 404: more retries (indexing delay)
  SERVER_ERROR: 3, // 5xx: standard
  DEFAULT: 3,
} as const;

/** Retry delays in milliseconds */
const RETRY_DELAYS = {
  NOT_FOUND_INITIAL: 500,
  NOT_FOUND_MAX: 10_000,
  SERVER_ERROR_INITIAL: 1_000,
  SERVER_ERROR_MAX: 30_000,
} as const;

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Determines if a Nexus API error should be retried
 *
 * Retry strategy:
 * - 404: 5 retries (content indexing delay)
 * - 5xx/429: 3 retries (server errors, rate limits)
 * - 4xx (except 404, 429): no retry (client errors)
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (!isAppError(error)) {
    return failureCount < RETRY_LIMITS.DEFAULT;
  }

  const { statusCode, type } = error;

  // Permanent failures - don't retry
  if (NON_RETRYABLE_ERROR_TYPES.includes(type as NexusErrorType)) {
    return false;
  }

  // 404: Content not yet indexed - more retries
  if (statusCode === 404) {
    return failureCount < RETRY_LIMITS.NOT_FOUND;
  }

  // 5xx or 429: Transient server errors - standard retries
  if (statusCode >= 500 || statusCode === 429) {
    return failureCount < RETRY_LIMITS.SERVER_ERROR;
  }

  // Other 4xx: Client errors - don't retry
  if (statusCode >= 400) {
    return false;
  }

  return failureCount < RETRY_LIMITS.DEFAULT;
}

/**
 * Calculates retry delay with exponential backoff
 *
 * - 404: 500ms → 1s → 2s → 4s → 8s (max 10s)
 * - 5xx: 1s → 2s → 4s → 8s → 16s (max 30s)
 */
function retryDelay(attemptIndex: number, error: unknown): number {
  if (isAppError(error) && error.statusCode === 404) {
    return Math.min(RETRY_DELAYS.NOT_FOUND_INITIAL * 2 ** attemptIndex, RETRY_DELAYS.NOT_FOUND_MAX);
  }
  return Math.min(RETRY_DELAYS.SERVER_ERROR_INITIAL * 2 ** attemptIndex, RETRY_DELAYS.SERVER_ERROR_MAX);
}

// ============================================================================
// Query Client
// ============================================================================

/**
 * QueryClient configured with Nexus-specific retry logic.
 * Used by queryNexus() for imperative fetching with automatic retries.
 */
export const nexusQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: retryDelay,
      staleTime: 0, // Always fetch fresh
      gcTime: 30 * 60 * 1000, // Keep in cache for 30 min
    },
  },
});
