import * as Core from '@/core';
/**
 * Search API Endpoints
 *
 * All API endpoints related to search operations
 */

const PREFIX = 'search';

export function buildTagBaseUrlWithParams(
  optParams: Omit<Record<string, unknown>, 'tag' | 'prefix'>,
  baseRoute: string,
): string {
  const queryParams = new URLSearchParams();

  // Add all parameters that exist (much simpler!)
  Object.entries(optParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const relativeUrl = `${baseRoute}?${queryParams.toString()}`;
  return Core.buildNexusUrl(relativeUrl);
}

export const SEARCH_API = {
  by_tag: (params: Core.TTagSearchParams) => buildTagBaseUrlWithParams(params, `${PREFIX}/posts/by_tag/${params.tag}`),
  by_prefix: (params: Core.TPrefixSearchParams) =>
    buildTagBaseUrlWithParams(params, `${PREFIX}/tags/by_prefix/${params.prefix}`),
  by_user: (params: Core.TPrefixSearchParams) =>
    buildTagBaseUrlWithParams(params, `${PREFIX}/users/by_id/${params.prefix}`),
  by_username: (params: Core.TPrefixSearchParams) =>
    buildTagBaseUrlWithParams(params, `${PREFIX}/users/by_name/${params.prefix}`),
};
