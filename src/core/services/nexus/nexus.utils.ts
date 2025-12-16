import * as Config from '@/config';
import { nexusQueryClient } from './nexus.query-client';
import { NexusErrorType, createNexusError } from '@/libs';

/**
 * Shared API utilities for all endpoints
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
};

type HttpMethod = keyof typeof HTTP_METHODS;

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
 * Maps HTTP status codes to specific Nexus error types
 */
export function mapHttpStatusToNexusErrorType(status: number): NexusErrorType {
  switch (status) {
    case 400:
      return NexusErrorType.INVALID_REQUEST;
    case 404:
      return NexusErrorType.RESOURCE_NOT_FOUND;
    case 429:
      return NexusErrorType.RATE_LIMIT_EXCEEDED;
    case 500:
      return NexusErrorType.INTERNAL_SERVER_ERROR;
    case 503:
      return NexusErrorType.SERVICE_UNAVAILABLE;
    default:
      return NexusErrorType.BOOTSTRAP_FAILED;
  }
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
export function ensureHttpResponseOk({ ok, status, statusText }: Response) {
  if (!ok) {
    const errorType = mapHttpStatusToNexusErrorType(status);
    throw createNexusError(errorType, `Request failed: ${statusText}`, status, {
      statusCode: status,
      statusText: statusText,
    });
  }
}

/**
 * Parses response body as JSON, throws NexusError if parsing fails
 * @param response - Response object
 * @returns Parsed JSON data
 * @throws {NexusError} When response body is not valid JSON
 */
export async function parseResponseOrThrow<T>(response: Response): Promise<T> {
  const text = await response.text();

  // Nexus API always returns JSON for successful responses.
  // Empty body on 2xx is unexpected - treat as server error.
  if (!text || text.trim() === '') {
    throw createNexusError(
      NexusErrorType.INVALID_RESPONSE,
      'Response body is empty (expected JSON)',
      500,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw createNexusError(NexusErrorType.INVALID_RESPONSE, 'Failed to parse JSON response', 500, {
      error,
    });
  }
}

/**
 * Raw fetch function without retry logic.
 * Used internally by queryNexus and for cases where retry is not desired.
 *
 * @param url - Full API endpoint URL
 * @param method - HTTP method (default: 'GET')
 * @param body - Request body (optional)
 * @returns Parsed response data
 * @throws {NexusError} When response is not ok or JSON parsing fails
 */
export async function fetchNexus<T>(url: string, method: HttpMethod = 'GET', body: BodyInit | null = null): Promise<T> {
  const response = await fetch(url, createFetchOptions(method, body));
  ensureHttpResponseOk(response);
  return parseResponseOrThrow<T>(response);
}

/**
 * Queries Nexus API with automatic retry logic via TanStack Query
 *
 * @param url - Full API endpoint URL
 * @param method - HTTP method (default: 'GET')
 * @param body - Request body (optional)
 * @returns Parsed response data
 * @throws {NexusError} When response is not ok after all retries
 */
export async function queryNexus<T>(url: string, method: HttpMethod = 'GET', body: BodyInit | null = null): Promise<T> {
  return nexusQueryClient.fetchQuery({
    queryKey: ['nexus', url, method, body],
    queryFn: () => fetchNexus<T>(url, method, body),
  });
}
