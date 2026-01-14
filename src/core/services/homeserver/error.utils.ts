import * as Libs from '@/libs';
import { HttpStatusCode } from '@/libs/http/http.types';
export const AUTH_FLOW_CANCELED_ERROR_NAME = 'AuthFlowCanceled';

const RETRYABLE_STATUS_CODES = [
  HttpStatusCode.REQUEST_TIMEOUT,
  HttpStatusCode.TOO_MANY_REQUESTS,
  HttpStatusCode.INTERNAL_SERVER_ERROR,
  HttpStatusCode.BAD_GATEWAY,
  HttpStatusCode.SERVICE_UNAVAILABLE,
  HttpStatusCode.GATEWAY_TIMEOUT,
] as const;

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
    if (message.includes(HttpStatusCode.GATEWAY_TIMEOUT.toString()) || message.includes('gateway')) return true;
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
  throw Libs.Err.auth(Libs.AuthErrorCode.SESSION_EXPIRED, errorMessage || 'Session expired', {
    service: Libs.ErrorService.Homeserver,
    operation: (additionalContext.operation as string | undefined) ?? 'unknown',
    context: { originalError: errorMessage, ...additionalContext },
  });
};

/**
 * Throws an INVALID_INPUT error for validation failures.
 * @param errorMessage - The original error message
 * @param additionalContext - Additional context to add to the error
 * @returns Never (always throws)
 */
const throwInvalidInputError = (errorMessage: string, additionalContext: Record<string, unknown>): never => {
  throw Libs.Err.validation(Libs.ValidationErrorCode.INVALID_INPUT, errorMessage, {
    service: Libs.ErrorService.Homeserver,
    operation: (additionalContext.operation as string | undefined) ?? 'unknown',
    context: { originalError: errorMessage, ...additionalContext },
  });
};

/**
 * Throws a homeserver error with the provided context.
 * Uses fromHttpResponse for proper HTTP status code mapping.
 * @param statusCode - The HTTP status code
 * @param errorMessage - The original error message
 * @param additionalContext - Additional context to add to the error
 * @returns Never (always throws)
 */
const throwHomeserverError = (
  statusCode: number,
  errorMessage: string,
  additionalContext: Record<string, unknown>,
): never => {
  const operation = (additionalContext.operation as string | undefined) ?? 'unknown';
  const url = (additionalContext.url as string | undefined) ?? 'unknown';

  // Create minimal Response for fromHttpResponse to get proper status code mapping
  const mockResponse = {
    status: statusCode,
    statusText: errorMessage,
    ok: false,
    headers: new Headers(),
  } as Response;

  throw Libs.fromHttpResponse(mockResponse, Libs.ErrorService.Homeserver, operation, url);
};

/**
 * Handles typed errors by transforming them into appropriate AppError types.
 * Routes to specialized throwers based on error name and status code.
 *
 * @param errorMessage - The original error message
 * @param errorName - The error name (e.g., 'InvalidInput', 'AuthenticationError')
 * @param statusCode - The HTTP status code
 * @param additionalContext - Additional context to add to the error
 * @returns Never (always throws)
 */
const handleTypedError = (
  errorMessage: string,
  errorName: string | undefined,
  statusCode: number,
  additionalContext: Record<string, unknown>,
): never => {
  if (errorName === 'InvalidInput') {
    return throwInvalidInputError(errorMessage, additionalContext);
  }

  if (errorName === 'AuthenticationError' || statusCode === HttpStatusCode.UNAUTHORIZED) {
    return throwSessionExpiredError(errorMessage, additionalContext);
  }

  return throwHomeserverError(statusCode, errorMessage, additionalContext);
};

/**
 * Handles errors from the homeserver.
 * Transforms various error types into standardized AppError instances.
 *
 * @param error - The error to handle
 * @param additionalContext - Additional context to add to the error
 * @param statusCode - Fallback status code if not extractable from error (default: 500)
 * @param alwaysUseHomeserverError - Whether to always use the homeserver error
 * @returns Never (always throws)
 */
export const handleError = (
  error: unknown,
  additionalContext: Record<string, unknown> = {},
  statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
  alwaysUseHomeserverError = false,
): never => {
  // Re-throw existing AppErrors as-is
  if (error instanceof Libs.AppError) {
    throw error;
  }

  const resolvedStatusCode = extractStatusCode(error) ?? statusCode;

  // Handle Pubky SDK errors
  if (isPubkyErrorLike(error)) {
    return handleTypedError(error.message, error.name, resolvedStatusCode, additionalContext);
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return handleTypedError(error.message, undefined, resolvedStatusCode, additionalContext);
  }

  // Handle unknown error types
  if (alwaysUseHomeserverError) {
    return throwHomeserverError(resolvedStatusCode, String(error), additionalContext);
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  throw Libs.Err.network(Libs.NetworkErrorCode.CONNECTION_REFUSED, errorMessage, {
    service: Libs.ErrorService.Homeserver,
    operation: (additionalContext.operation as string | undefined) ?? 'unknown',
    context: { statusCode: resolvedStatusCode, ...additionalContext },
    cause: error,
  });
};
