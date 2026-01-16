import * as Core from '@/core';
/**
 * Search API Endpoints
 *
 * All API endpoints related to search operations
 */

const PREFIX = 'v0/search';

export const searchApi = {
  byTag: (params: Core.TTagSearchParams) => {
    const tag = Core.encodePathSegment(params.tag);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/posts/by_tag/${tag}`,
      params,
      excludeKeys: Core.SEARCH_PATH_PARAMS,
    });
  },
  byPrefix: (params: Core.TPrefixSearchParams) => {
    const prefix = Core.encodePathSegment(params.prefix);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/tags/by_prefix/${prefix}`,
      params,
      excludeKeys: Core.SEARCH_PATH_PARAMS,
    });
  },
  byUser: (params: Core.TPrefixSearchParams) => {
    const prefix = Core.encodePathSegment(params.prefix);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/users/by_id/${prefix}`,
      params,
      excludeKeys: Core.SEARCH_PATH_PARAMS,
    });
  },
  byUsername: (params: Core.TPrefixSearchParams) => {
    const prefix = Core.encodePathSegment(params.prefix);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/users/by_name/${prefix}`,
      params,
      excludeKeys: Core.SEARCH_PATH_PARAMS,
    });
  },
};

export type SearchApiEndpoint = keyof typeof searchApi;
