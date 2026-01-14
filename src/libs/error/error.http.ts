import { AppError } from './error';
import { ErrorService } from './error.types';
import { ServerErrorCode, TimeoutErrorCode, ClientErrorCode, AuthErrorCode, RateLimitErrorCode } from './error.codes';
import { Err } from './error.factories';
import { HttpStatusCode } from '../http';

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
  if (status >= HttpStatusCode.INTERNAL_SERVER_ERROR) {
    if (status === HttpStatusCode.GATEWAY_TIMEOUT) {
      return Err.timeout(TimeoutErrorCode.GATEWAY_TIMEOUT, message, baseParams);
    }
    const code =
      status === HttpStatusCode.SERVICE_UNAVAILABLE
        ? ServerErrorCode.SERVICE_UNAVAILABLE
        : status === HttpStatusCode.BAD_GATEWAY
          ? ServerErrorCode.BAD_GATEWAY
          : ServerErrorCode.INTERNAL_ERROR;
    return Err.server(code, message, baseParams);
  }

  // 429 Rate Limited
  if (status === HttpStatusCode.TOO_MANY_REQUESTS) {
    const retryAfter = response.headers.get('retry-after');
    return Err.rateLimit(RateLimitErrorCode.RATE_LIMITED, message, {
      ...baseParams,
      context: { ...baseParams.context, retryAfter: retryAfter ? parseInt(retryAfter) : undefined },
    });
  }

  // 401/403 Auth Errors
  if (status === HttpStatusCode.UNAUTHORIZED) {
    return Err.auth(AuthErrorCode.UNAUTHORIZED, message, baseParams);
  }
  if (status === HttpStatusCode.FORBIDDEN) {
    return Err.auth(AuthErrorCode.FORBIDDEN, message, baseParams);
  }

  // 408 Timeout
  if (status === HttpStatusCode.REQUEST_TIMEOUT) {
    return Err.timeout(TimeoutErrorCode.REQUEST_TIMEOUT, message, baseParams);
  }

  // 404 Not Found
  if (status === HttpStatusCode.NOT_FOUND) {
    return Err.client(ClientErrorCode.NOT_FOUND, message, baseParams);
  }

  // 409 Conflict
  if (status === HttpStatusCode.CONFLICT) {
    return Err.client(ClientErrorCode.CONFLICT, message, baseParams);
  }

  // 413 Payload Too Large
  if (status === HttpStatusCode.PAYLOAD_TOO_LARGE) {
    return Err.client(ClientErrorCode.PAYLOAD_TOO_LARGE, message, baseParams);
  }

  // 410 Gone
  if (status === HttpStatusCode.GONE) {
    return Err.client(ClientErrorCode.GONE, message, baseParams);
  }

  // 422 Unprocessable
  if (status === HttpStatusCode.UNPROCESSABLE_ENTITY) {
    return Err.client(ClientErrorCode.UNPROCESSABLE, message, baseParams);
  }

  // Other 4xx
  if (status >= HttpStatusCode.BAD_REQUEST) {
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
 * @throws AppError when response is not ok (status >= BAD_REQUEST)
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
