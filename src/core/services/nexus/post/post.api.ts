import * as Core from '@/core';

/**
 * Post API Endpoints
 *
 * All API endpoints related to post operations
 */

const PREFIX = 'post';

export function buildPostBaseUrlWithParams(optParams: Core.TPostQueryParams, baseRoute: string): string {
  const queryParams = new URLSearchParams();

  // Add only query parameters (exclude path params)
  Object.entries(optParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !(Core.POST_PATH_PARAMS as readonly string[]).includes(key)) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const relativeUrl = queryString ? `${baseRoute}?${queryString}` : baseRoute;

  return Core.buildNexusUrl(relativeUrl);
}

export const postApi = {
  view: (params: Core.TPostViewParams) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}`),
  bookmarks: (params: Core.TPostBase) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}/bookmarks`),
  counts: (params: Core.TPostBasePathParams) =>
    Core.buildNexusUrl(`${PREFIX}/${params.author_id}/${params.post_id}/counts`),
  details: (params: Core.TPostBasePathParams) =>
    Core.buildNexusUrl(`${PREFIX}/${params.author_id}/${params.post_id}/details`),
  taggers: (params: Core.TPostTaggersParams) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}/taggers/${params.label}`),
  tags: (params: Core.TPostTagsParams) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}/tags`),
};
