import * as Core from '@/core';

/**
 * Tag API Endpoints
 *
 * All API endpoints related to tag operations
 */

export function buildTagsBaseUrlWithParams(optParams: Core.TTagsQueryParams, baseRoute: string): string {
  const queryParams = new URLSearchParams();

  // Add only query parameters (exclude path params)
  Object.entries(optParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !(Core.TAGS_PATH_PARAMS as readonly string[]).includes(key)) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const relativeUrl = queryString ? `${baseRoute}?${queryString}` : baseRoute;

  return Core.buildNexusUrl(relativeUrl);
}

const PREFIX = 'tags';

export const tagApi = {
  view: (params: Core.TTagViewParams) => {
    const taggerId = Core.encodePathSegment(params.taggerId);
    const tagId = Core.encodePathSegment(params.tagId);
    return Core.buildNexusUrl(`${PREFIX}/${taggerId}/${tagId}`);
  },
  hot: (params: Core.TTagHotParams) => buildTagsBaseUrlWithParams(params, `${PREFIX}/hot`),
  taggers: (params: Core.TTagTaggersParams) => {
    const label = Core.encodePathSegment(params.label);
    return buildTagsBaseUrlWithParams(params, `${PREFIX}/taggers/${label}`);
  },
};
