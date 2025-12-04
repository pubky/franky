import * as Core from '@/core';
/**
 * Search API Endpoints
 *
 * All API endpoints related to search operations
 */

const PREFIX = 'v0/search';

export const searchApi = {
  byTag: (params: Core.TTagParams) => {
    const tag = Core.encodePathSegment(params.tag);
    return Core.buildUrlWithQuery(`${PREFIX}/posts/by_tag/${tag}`, params, Core.SEARCH_PATH_PARAMS);
  },
  byPrefix: (params: Core.TPrefixSearchParams) => {
    const prefix = Core.encodePathSegment(params.prefix);
    return Core.buildUrlWithQuery(`${PREFIX}/tags/by_prefix/${prefix}`, params, Core.SEARCH_PATH_PARAMS);
  },
  byUser: (params: Core.TPrefixSearchParams) => {
    const prefix = Core.encodePathSegment(params.prefix);
    return Core.buildUrlWithQuery(`${PREFIX}/users/by_id/${prefix}`, params, Core.SEARCH_PATH_PARAMS);
  },
  byUsername: (params: Core.TPrefixSearchParams) => {
    const prefix = Core.encodePathSegment(params.prefix);
    return Core.buildUrlWithQuery(`${PREFIX}/users/by_name/${prefix}`, params, Core.SEARCH_PATH_PARAMS);
  },
};

export type SearchApiEndpoint = keyof typeof searchApi;
