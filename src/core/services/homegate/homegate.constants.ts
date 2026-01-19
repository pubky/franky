/**
 * Query keys for Homegate service.
 * Centralized to ensure consistency between service caching and hook cache reading.
 */
export const HOMEGATE_QUERY_KEYS = {
  lnVerificationInfo: ['homegate', 'ln-verification-info'] as const,
  smsVerificationInfo: ['homegate', 'sms-verification-info'] as const,
} as const;
