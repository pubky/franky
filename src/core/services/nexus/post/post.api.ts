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
  view: (params: Core.TPostViewParams) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    return buildPostBaseUrlWithParams(params, `${PREFIX}/${author}/${post}`);
  },
  bookmarks: (params: Core.TPostBase) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    return buildPostBaseUrlWithParams(params, `${PREFIX}/${author}/${post}/bookmarks`);
  },
  counts: (params: Core.TPostBasePathParams) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    return Core.buildNexusUrl(`${PREFIX}/${author}/${post}/counts`);
  },
  details: (params: Core.TPostBasePathParams) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    return Core.buildNexusUrl(`${PREFIX}/${author}/${post}/details`);
  },
  taggers: (params: Core.TPostTaggersParams) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    const label = Core.encodePathSegment(params.label);
    return buildPostBaseUrlWithParams(params, `${PREFIX}/${author}/${post}/taggers/${label}`);
  },
  tags: (params: Core.TPostTagsParams) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    return buildPostBaseUrlWithParams(params, `${PREFIX}/${author}/${post}/tags`);
  },
};
