import * as Libs from '@/libs';

export const AUTH_FLOW_CANCELED_ERROR_NAME = 'AuthFlowCanceled';

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504] as const;
type RetryableStatusCode = (typeof RETRYABLE_STATUS_CODES)[number];

/**
 * Extracts status code from error objects (checks error directly first, then nested data)
 * @param error - The error to extract status code from
 * @returns The status code if found, undefined otherwise
 */
export const extractStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;

  if ('statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number') {
    return (error as { statusCode: number }).statusCode;
  }

  if (!('data' in error)) return undefined;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) return undefined;
  if (!('statusCode' in data)) return undefined;
  const statusCode = (data as { statusCode?: unknown }).statusCode;
  return typeof statusCode === 'number' ? statusCode : undefined;
};

/**
 * Checks if a relay poll error is retryable based on status code or error message
 * @param error - The error to check
 * @returns True if the error is retryable, false otherwise
 */
export const isRetryableRelayPollError = (error: unknown): boolean => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'RequestError'
  ) {
    const statusCode = extractStatusCode(error);
    // No status code typically means a network-level failure (DNS, connection refused, etc.)
    // These are transient issues worth retrying during auth polling
    if (!statusCode) return true;
    return RETRYABLE_STATUS_CODES.includes(statusCode as RetryableStatusCode);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('timed out') || message.includes('timeout')) return true;
    if (message.includes('504') || message.includes('gateway')) return true;
  }

  return false;
};

/**
 * Creates a canceled error for auth flows.
 *
 * Uses plain Error (not AppError) intentionally — cancellation is a control flow
 * signal, not an actual error. It's caught by name and handled as a normal exit path.
 *
 * @returns An Error with the canceled error name
 */
export const createCanceledError = (): Error => {
  const error = new Error('Auth flow canceled');
  error.name = AUTH_FLOW_CANCELED_ERROR_NAME;
  return error;
};

/**
 * Type guard to check if an error has the shape of a Pubky error
 * @param error - The error to check
 * @returns True if the error has Pubky error shape, false otherwise
 */
export const isPubkyErrorLike = (error: unknown): error is { name: string; message: string; data?: unknown } => {
  if (typeof error !== 'object' || error === null) return false;
  return (
    'name' in error &&
    typeof (error as { name?: unknown }).name === 'string' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
};

/**
 * Throws a SESSION_EXPIRED error for authentication failures.
 * @param errorMessage - The original error message
 * @param additionalContext - Additional context to add to the error
 * @returns Never (always throws)
 */
const throwSessionExpiredError = (errorMessage: string, additionalContext: Record<string, unknown>): never => {
  throw Libs.createHomeserverError(Libs.HomeserverErrorType.SESSION_EXPIRED, errorMessage || 'Session expired', 401, {
    originalError: errorMessage,
    ...additionalContext,
  });
};

/**
 * Throws an INVALID_INPUT error for validation failures.
 * @param errorMessage - The original error message
 * @param additionalContext - Additional context to add to the error
 * @returns Never (always throws)
 */
const throwInvalidInputError = (errorMessage: string, additionalContext: Record<string, unknown>): never => {
  throw Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, errorMessage, 400, {
    originalError: errorMessage,
    ...additionalContext,
  });
};

/**
 * Throws a homeserver error with the provided context.
 * @param homeserverErrorType - The type of homeserver error
 * @param message - The error message
 * @param statusCode - The HTTP status code
 * @param errorMessage - The original error message
 * @param additionalContext - Additional context to add to the error
 * @returns Never (always throws)
 */
const throwHomeserverError = (
  homeserverErrorType: Libs.HomeserverErrorType,
  message: string,
  statusCode: number,
  errorMessage: string,
  additionalContext: Record<string, unknown>,
): never => {
  throw Libs.createHomeserverError(homeserverErrorType, message, statusCode, {
    originalError: errorMessage,
    ...additionalContext,
  });
};

/**
 * Handles typed errors by transforming them into appropriate AppError types.
 * Routes to specialized throwers based on error name and status code.
 *
 * @param errorMessage - The original error message
 * @param errorName - The error name (e.g., 'InvalidInput', 'AuthenticationError')
 * @param homeserverErrorType - The type of homeserver error
 * @param message - The error message for display
 * @param statusCode - The HTTP status code
 * @param additionalContext - Additional context to add to the error
 * @returns Never (always throws)
 */
const handleTypedError = (
  errorMessage: string,
  errorName: string | undefined,
  homeserverErrorType: Libs.HomeserverErrorType,
  message: string,
  statusCode: number,
  additionalContext: Record<string, unknown>,
): never => {
  if (errorName === 'InvalidInput') {
    return throwInvalidInputError(errorMessage, additionalContext);
  }

  if (errorName === 'AuthenticationError' || statusCode === 401) {
    return throwSessionExpiredError(errorMessage, additionalContext);
  }

  return throwHomeserverError(homeserverErrorType, message, statusCode, errorMessage, additionalContext);
};

/**
 * Handles errors from the homeserver.
 * Transforms various error types into standardized AppError instances.
 *
 * @param error - The error to handle
 * @param homeserverErrorType - The type of error
 * @param message - The message to use
 * @param statusCode - The status code to use
 * @param additionalContext - Additional context to add to the error
 * @param alwaysUseHomeserverError - Whether to always use the homeserver error
 * @returns Never (always throws)
 */
export const handleError = (
  error: unknown,
  homeserverErrorType: Libs.HomeserverErrorType,
  message: string,
  statusCode: number,
  additionalContext: Record<string, unknown> = {},
  alwaysUseHomeserverError = false,
): never => {
  // Re-throw existing AppErrors as-is
  if (error instanceof Libs.AppError) {
    throw error;
  }

  const resolvedStatusCode = extractStatusCode(error) ?? statusCode;

  // Handle Pubky SDK errors
  if (isPubkyErrorLike(error)) {
    return handleTypedError(error.message, error.name, homeserverErrorType, message, resolvedStatusCode, additionalContext);
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return handleTypedError(error.message, undefined, homeserverErrorType, message, resolvedStatusCode, additionalContext);
  }

  // Handle unknown error types
  if (alwaysUseHomeserverError) {
    return throwHomeserverError(homeserverErrorType, message, resolvedStatusCode, String(error), additionalContext);
  }

  throw Libs.createCommonError(
    Libs.CommonErrorType.NETWORK_ERROR,
    `An unexpected error occurred during ${message.toLowerCase()}`,
    resolvedStatusCode,
    { error, ...additionalContext },
  );
};

