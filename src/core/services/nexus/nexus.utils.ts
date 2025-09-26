import * as Config from '@/config';

/**
 * Shared API utilities for all endpoints
 */

export function buildNexusUrl(endpoint: string): string {
  return `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/${endpoint}`;
}

export function buildNexusStaticUrl(endpoint: string): string {
  return `${Config.NEXUS_URL}/static/${endpoint}`;
}

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
