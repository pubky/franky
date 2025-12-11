import * as Config from '@/config';
import * as Libs from '@/libs';
import type { HttpMethod } from './nexus.types';

/**
 * Shared API utilities for all endpoints
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
} as const;

export function buildNexusUrl(endpoint: string): string {
  return `${Config.NEXUS_URL}/${endpoint}`;
}

export function buildCdnUrl(endpoint: string): string {
  return `${Config.CDN_URL}/${endpoint}`;
}

/**
 * Encodes a path segment to ensure safe URL construction
 * @param segment - The path segment to encode
 * @returns Encoded path segment safe for URL interpolation
 */
export function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment);
}

/**
 * Builds a Nexus URL with query parameters, excluding specified path parameter keys
 * @param baseRoute - The base route path (e.g., 'post/123/details')
 * @param params - Object containing all parameters
 * @param excludeKeys - Array of keys that are path parameters and should be excluded from query string
 * @returns Full Nexus URL with query parameters appended
 */
export function buildUrlWithQuery(
  baseRoute: string,
  params: Record<string, unknown>,
  excludeKeys: readonly string[] = [],
): string {
  const queryParams = new URLSearchParams();

  // Add only query parameters (exclude path params)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !excludeKeys.includes(key)) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const relativeUrl = queryString ? `${baseRoute}?${queryString}` : baseRoute;

  return buildNexusUrl(relativeUrl);
}

/**
 * Utility function to create fetch options with common headers
 */
export function createFetchOptions(method: HttpMethod = 'GET', body?: BodyInit | null): RequestInit {
  const options: RequestInit = {
    method: HTTP_METHODS[method],
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) options.body = body;

  return options;
}

/**
 * Ensures HTTP response is successful, throws NexusError if not
 * @param response - Response object with ok, status, and statusText properties
 * @throws {NexusError} When response is not ok (status >= 400)
 */
export function ensureHttpResponseOk({ ok, status, statusText }: Response): void {
  if (!ok) {
    const errorType = Libs.mapHttpStatusToNexusErrorType(status);
    throw Libs.createNexusError(errorType, `Request failed: ${statusText}`, status, {
      statusCode: status,
      statusText: statusText,
    });
  }
}

/**
 * Parses response body as JSON, throws NexusError if parsing fails
 * @param response - Response object
 * @param noContentDefaultValue - Default value to return when response has no content (e.g., [] for arrays, undefined for objects)
 * @returns Parsed JSON data
 * @throws {NexusError} When response body is not valid JSON
 */
export async function parseResponseOrThrow<T>(response: Response): Promise<T | undefined> {
  // 204 No Content never has a body, so return early
  if (response.status === 204) {
    return undefined;
  }

  // Check if response has a body by checking content-length header
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return undefined;
  }

  try {
    // Try to read the body as text first to check if it's empty
    // This handles cases like 201 Created which might have an empty body
    const text = await response.text();
    if (!text || text.trim() === '') {
      return undefined;
    }
    return JSON.parse(text) as T;
  } catch (error) {
    throw Libs.createNexusError(Libs.NexusErrorType.INVALID_RESPONSE, 'Failed to parse response', 500, {
      error,
    });
  }
}

/**
 * Queries Nexus API and returns parsed response data
 * @param url - Full API endpoint URL
 * @param method - HTTP method (default: 'GET')
 * @param body - Request body (optional)
 * @param noContentDefaultValue - Default value to return when response has no content (e.g., [] for arrays, undefined for objects)
 * @returns Parsed response data
 * @throws {NexusError} When response is not ok or JSON parsing fails
 */
export async function queryNexus<T>(
  url: string,
  method: HttpMethod = 'GET',
  body: BodyInit | null = null,
): Promise<T | undefined> {
  const response = await fetch(url, createFetchOptions(method, body));
  ensureHttpResponseOk(response);
  return parseResponseOrThrow<T>(response);
}
