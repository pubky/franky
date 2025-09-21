/**
 * Shared API utilities for all models
 */

import * as Config from '@/config';

/**
 * Build full URL for an endpoint
 * @param endpoint - Endpoint path
 * @returns Full URL
 */
export function buildNexusUrl(endpoint: string): string {
  return `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/${endpoint}`;
}

export function buildNexusStaticUrl(endpoint: string): string {
  return `${Config.NEXUS_URL}/static/${endpoint}`;
}

/**
 * HTTP methods for API calls
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
};

type HttpMethod = keyof typeof HTTP_METHODS;

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
