import { createQueryClient, CommonErrorType } from '@/libs';

/**
 * Homegate API Query Client
 *
 * Used for caching Homegate API responses like the Lightning verification price.
 */
export const homegateQueryClient = createQueryClient({
  retry: {
    nonRetryable: [CommonErrorType.INVALID_INPUT],
    limits: {
      serverError: 3,
      default: 3,
    },
    delays: {
      serverError: { initial: 1_000, max: 30_000 },
      default: { initial: 1_000, max: 30_000 },
    },
  },
  // Price doesn't change often, cache for 30 minutes
  staleTime: 30 * 60 * 1000,
});
