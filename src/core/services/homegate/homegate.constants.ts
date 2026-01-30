/**
 * Query keys for Homegate service.
 * Centralized to ensure consistency between service caching and hook cache reading.
 */
export const HOMEGATE_QUERY_KEYS = {
  lnVerificationInfo: ['homegate', 'ln-verification-info'] as const,
  smsVerificationInfo: ['homegate', 'sms-verification-info'] as const,
} as const;

/**
 * Error types for SMS code sending failures.
 * Used by both the service layer (to return errors) and UI layer (to display appropriate messages).
 */
export const SmsCodeErrorType = {
  /** Phone number is blocked and cannot be used */
  BLOCKED: 'blocked',
  /** External service rate limit, user can retry after waiting */
  RATE_LIMITED_TEMPORARY: 'rate_limited_temporary',
  /** Phone number has exceeded weekly verification limit (2 per week) */
  RATE_LIMITED_WEEKLY: 'rate_limited_weekly',
  /** Phone number has exceeded yearly verification limit (4 per year) */
  RATE_LIMITED_YEARLY: 'rate_limited_yearly',
  /** An unknown error occurred */
  UNKNOWN: 'unknown',
} as const;
