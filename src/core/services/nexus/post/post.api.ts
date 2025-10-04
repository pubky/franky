import * as Core from '@/core';

/**
 * Post API Endpoints
 *
 * All API endpoints related to post operations
 */

const PREFIX = 'post';

export const postApi = {
  view: (params: Core.TPostViewParams) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    return Core.buildUrlWithQuery(`${PREFIX}/${author}/${post}`, params, Core.POST_PATH_PARAMS);
  },
  bookmarks: (params: Core.TPostBase) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    return Core.buildUrlWithQuery(`${PREFIX}/${author}/${post}/bookmarks`, params, Core.POST_PATH_PARAMS);
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
    return Core.buildUrlWithQuery(`${PREFIX}/${author}/${post}/taggers/${label}`, params, Core.POST_PATH_PARAMS);
  },
  tags: (params: Core.TPostTagsParams) => {
    const author = Core.encodePathSegment(params.author_id);
    const post = Core.encodePathSegment(params.post_id);
    return Core.buildUrlWithQuery(`${PREFIX}/${author}/${post}/tags`, params, Core.POST_PATH_PARAMS);
  },
};

export type PostApiEndpoint = keyof typeof postApi;
