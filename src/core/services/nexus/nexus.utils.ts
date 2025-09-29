import * as Config from '@/config';
import * as Libs from '@/libs';

/**
 * Shared API utilities for all endpoints
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
};

type HttpMethod = keyof typeof HTTP_METHODS;

export function buildNexusUrl(endpoint: string): string {
  return `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/${endpoint}`;
}

export function buildNexusStaticUrl(endpoint: string): string {
  return `${Config.NEXUS_URL}/static/${endpoint}`;
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
 * @returns Parsed JSON data
 * @throws {NexusError} When response body is not valid JSON
 */
export async function parseResponseOrThrow<T>(response: Response): Promise<T> {
  let data: unknown;
  try {
    data = await response.json();
    return data as T;
  } catch (error) {
    throw Libs.createNexusError(Libs.NexusErrorType.INVALID_RESPONSE, 'Failed to parse response', 500, {
      error,
    });
  }
}

/**
 * Queries Nexus API and returns parsed response data
 * @param url - Full API endpoint URL
 * @returns Parsed response data
 * @throws {NexusError} When response is not ok or JSON parsing fails
 */
export async function queryNexus<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, createFetchOptions());
    ensureHttpResponseOk(response);
    return parseResponseOrThrow<T>(response);
  } catch (error) {
    throw error;
  }
}
