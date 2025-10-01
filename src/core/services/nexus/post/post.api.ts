import * as Core from '@/core';

/**
 * Post API Endpoints
 *
 * All API endpoints related to post operations
 */

const PREFIX = 'post';

export function buildPostBaseUrlWithParams(
  optParams: Omit<Record<string, unknown>, 'author_id' | 'post_id'>,
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

export const POST_API = {
  view: (params: Core.TPostViewParams) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}`),
  bookmarks: (params: Core.TPostBase) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}/bookmarks`),
  counts: (params: Omit<Core.TPostBase, 'viewer_id'>) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}/counts`),
  details: (params: Omit<Core.TPostBase, 'viewer_id'>) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}/details`),
  taggers: (params: Core.TPostTaggersParams) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}/taggers/${params.label}`),
  tags: (params: Core.TPostTagsParams) =>
    buildPostBaseUrlWithParams(params, `${PREFIX}/${params.author_id}/${params.post_id}/tags`),
};
