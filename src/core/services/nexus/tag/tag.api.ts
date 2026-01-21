import * as Core from '@/core';

/**
 * Tag API Endpoints
 *
 * All API endpoints related to tag operations
 */

const PREFIX = 'v0/tags';

export const tagApi = {
  view: (params: Core.TTagViewParams) => {
    const taggerId = Core.encodePathSegment(params.taggerId);
    const tagId = Core.encodePathSegment(params.tagId);
    return Core.buildNexusUrl(`${PREFIX}/${taggerId}/${tagId}`);
  },
  hot: (params: Core.TTagHotParams) =>
    Core.buildUrlWithQuery({ baseRoute: `${PREFIX}/hot`, params, excludeKeys: Core.TAGS_PATH_PARAMS }),
  taggers: (params: Core.TTagTaggersParams) => {
    const label = Core.encodePathSegment(params.label);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/taggers/${label}`,
      params,
      excludeKeys: Core.TAGS_PATH_PARAMS,
    });
  },
};

export type TagApiEndpoint = keyof typeof tagApi;
