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
export { httpStatusCodeToError, httpResponseToError, safeFetch } from './error.http';

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

// Error messages
export * from './error.messages';
