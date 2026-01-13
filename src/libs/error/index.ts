// =============================================================================
// NEW ERROR SYSTEM (Phase 1)
// =============================================================================

// Core types and enums
export { ErrorCategory, ErrorService } from './error.types';
export {
  NetworkErrorCode,
  TimeoutErrorCode,
  ServerErrorCode,
  ClientErrorCode,
  AuthErrorCode,
  RateLimitErrorCode,
  ValidationErrorCode,
  DatabaseErrorCode,
  type ErrorCode,
  type ErrorCodeByCategory,
} from './error.codes';

// AppError class and params type
export { AppError, type AppErrorParams } from './error';

// Error factories
export { Err } from './error.factories';

// HTTP helpers
export { fromHttpResponse, ensureHttpResponseOk } from './error.http';

// Utility functions
export {
  isAppError,
  isNetworkError,
  isTimeoutError,
  isServerError,
  isClientError,
  isAuthError,
  isRateLimitError,
  isValidationError,
  isDatabaseError,
  isRetryable,
  requiresLogin,
  isNotFound,
  getRetryAfter,
  toAppError,
  getErrorMessage,
} from './error.utils';

// =============================================================================
// LEGACY EXPORTS (Deprecated - will be removed in Phase 2)
// =============================================================================

// Legacy error types
export {
  /** @deprecated Use ErrorCategory instead */
  NexusErrorType,
  /** @deprecated Use ErrorCategory instead */
  HomeserverErrorType,
  /** @deprecated Use ErrorCategory instead */
  DatabaseErrorType,
  /** @deprecated Use ErrorCategory instead */
  CommonErrorType,
  /** @deprecated Use ErrorCategory instead */
  SanitizationErrorType,
  /** @deprecated Use ErrorCategory instead */
  type AppErrorType,
} from './error.types';

// Legacy error factories
export {
  /** @deprecated Use Err.server() or Err.client() instead */
  createNexusError,
  /** @deprecated Use Err.server() or Err.auth() instead */
  createHomeserverError,
  /** @deprecated Use Err.validation() or Err.server() instead */
  createCommonError,
  /** @deprecated Use Err.database() instead */
  createDatabaseError,
  /** @deprecated Use Err.client() instead */
  createSanitizationError,
} from './error';

// Error messages (kept for backward compatibility)
export * from './error.messages';
