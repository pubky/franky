import { AppError } from './error';
import { ErrorService } from './error.types';
import { ServerErrorCode, TimeoutErrorCode, ClientErrorCode, AuthErrorCode, RateLimitErrorCode } from './error.codes';
import { Err } from './error.factories';

/**
 * Creates appropriate AppError from HTTP response.
 * Use this in remote services to standardize HTTP error handling.
 *
 * @param response - The HTTP Response object
 * @param service - Which service produced the error
 * @param operation - Which operation failed
 * @param endpoint - The endpoint URL (for context)
 * @returns AppError with appropriate category and code based on status
 *
 * @example
 * ```typescript
 * if (!response.ok) {
 *   throw fromHttpResponse(response, ErrorService.Homegate, 'verifySmsCode', url);
 * }
 * ```
 */
export function fromHttpResponse(
  response: Response,
  service: ErrorService,
  operation: string,
  endpoint: string,
): AppError {
  const { status, statusText } = response;
  const message = statusText || 'Request failed';
  const baseParams = { service, operation, context: { endpoint, statusCode: status } };

  // 5xx Server Errors
  if (status >= 500) {
    if (status === 504) {
      return Err.timeout(TimeoutErrorCode.GATEWAY_TIMEOUT, message, baseParams);
    }
    const code =
      status === 503
        ? ServerErrorCode.SERVICE_UNAVAILABLE
        : status === 502
          ? ServerErrorCode.BAD_GATEWAY
          : ServerErrorCode.INTERNAL_ERROR;
    return Err.server(code, message, baseParams);
  }

  // 429 Rate Limited
  if (status === 429) {
    const retryAfter = response.headers.get('retry-after');
    return Err.rateLimit(RateLimitErrorCode.RATE_LIMITED, message, {
      ...baseParams,
      context: { ...baseParams.context, retryAfter: retryAfter ? parseInt(retryAfter) : undefined },
    });
  }

  // 401/403 Auth Errors
  if (status === 401) {
    return Err.auth(AuthErrorCode.UNAUTHORIZED, message, baseParams);
  }
  if (status === 403) {
    return Err.auth(AuthErrorCode.FORBIDDEN, message, baseParams);
  }

  // 408 Timeout
  if (status === 408) {
    return Err.timeout(TimeoutErrorCode.REQUEST_TIMEOUT, message, baseParams);
  }

  // 404 Not Found
  if (status === 404) {
    return Err.client(ClientErrorCode.NOT_FOUND, message, baseParams);
  }

  // 409 Conflict
  if (status === 409) {
    return Err.client(ClientErrorCode.CONFLICT, message, baseParams);
  }

  // 410 Gone
  if (status === 410) {
    return Err.client(ClientErrorCode.GONE, message, baseParams);
  }

  // 422 Unprocessable
  if (status === 422) {
    return Err.client(ClientErrorCode.UNPROCESSABLE, message, baseParams);
  }

  // Other 4xx
  if (status >= 400) {
    return Err.client(ClientErrorCode.BAD_REQUEST, message, baseParams);
  }

  // Fallback for unexpected status codes
  return Err.server(ServerErrorCode.UNKNOWN_ERROR, message, baseParams);
}

/**
 * Ensures HTTP response is successful, throws AppError if not.
 * Convenience wrapper around fromHttpResponse for common pattern.
 *
 * @param response - The HTTP Response object
 * @param service - Which service produced the error
 * @param operation - Which operation failed
 * @param endpoint - The endpoint URL (for context)
 * @throws AppError when response is not ok (status >= 400)
 *
 * @example
 * ```typescript
 * const response = await fetch(url);
 * ensureHttpResponseOk(response, ErrorService.Nexus, 'fetchUser', url);
 * const data = await response.json();
 * ```
 */
export function ensureHttpResponseOk(
  response: Response,
  service: ErrorService,
  operation: string,
  endpoint: string,
): void {
  if (!response.ok) {
    throw fromHttpResponse(response, service, operation, endpoint);
  }
}
