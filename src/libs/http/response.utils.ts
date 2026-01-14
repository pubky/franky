import { Err, ServerErrorCode } from '../error';
import { ErrorService } from '../error/error.types';

/**
 * Parses response body as JSON, throws AppError if parsing fails.
 * Generic utility that can be used across different services.
 *
 * @param response - Response object
 * @param service - The service to attribute errors to (default: Nexus for backwards compatibility)
 * @param operation - The operation name for error context (default: 'parseResponse')
 * @returns Parsed JSON data
 * @throws {AppError} When response body is not valid JSON
 */
export async function parseResponseOrThrow<T>(
  response: Response,
  service: ErrorService = ErrorService.Nexus,
  operation: string = 'parseResponse',
): Promise<T> {
  const text = await response.text();

  if (!text || text.trim() === '') {
    throw Err.server(ServerErrorCode.INVALID_RESPONSE, 'Response body is empty (expected JSON)', {
      service,
      operation,
      context: { statusCode: response.status },
    });
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw Err.server(ServerErrorCode.INVALID_RESPONSE, 'Failed to parse JSON response', {
      service,
      operation,
      context: { statusCode: response.status, responseText: text.slice(0, 200) },
      cause: error,
    });
  }
}
