import * as Core from '@/core';
/**
 * Search API Endpoints
 *
 * All API endpoints related to search operations
 */

const PREFIX = 'search';

export function buildTagBaseUrlWithParams(optParams: Core.TSearchQueryParams, baseRoute: string): string {
  const queryParams = new URLSearchParams();

  // Add all parameters that exist (much simpler!)
  Object.entries(optParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !(Core.SEARCH_PATH_PARAMS as readonly string[]).includes(key)) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const relativeUrl = queryString ? `${baseRoute}?${queryString}` : baseRoute;
  return Core.buildNexusUrl(relativeUrl);
}

export const searchApi = {
  byTag: (params: Core.TTagSearchParams) => buildTagBaseUrlWithParams(params, `${PREFIX}/posts/by_tag/${params.tag}`),
  byPrefix: (params: Core.TPrefixSearchParams) =>
    buildTagBaseUrlWithParams(params, `${PREFIX}/tags/by_prefix/${params.prefix}`),
  byUser: (params: Core.TPrefixSearchParams) =>
    buildTagBaseUrlWithParams(params, `${PREFIX}/users/by_id/${params.prefix}`),
  byUsername: (params: Core.TPrefixSearchParams) =>
    buildTagBaseUrlWithParams(params, `${PREFIX}/users/by_name/${params.prefix}`),
};
