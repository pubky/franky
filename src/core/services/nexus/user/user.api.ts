import * as Core from '@/core';
/**
 * User API Endpoints
 *
 * All API endpoints related to user operations
 */

const PREFIX = 'user';

export function buildUserBaseUrlWithParams(optParams: Core.TUserQueryParams, baseRoute: string): string {
  const queryParams = new URLSearchParams();

  // Add all parameters that exist (much simpler!)
  Object.entries(optParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !(Core.USER_PATH_PARAMS as readonly string[]).includes(key)) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const relativeUrl = queryString ? `${baseRoute}?${queryString}` : baseRoute;

  return Core.buildNexusUrl(relativeUrl);
}

export const userApi = {
  view: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return buildUserBaseUrlWithParams(params, `${PREFIX}/${userId}`);
  },
  counts: (params: Core.TUserId) => {
    const userId = Core.encodePathSegment(params.user_id);
    return Core.buildNexusUrl(`${PREFIX}/${userId}/counts`);
  },
  details: (params: Core.TUserId) => {
    const userId = Core.encodePathSegment(params.user_id);
    return Core.buildNexusUrl(`${PREFIX}/${userId}/details`);
  },
  followers: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return buildUserBaseUrlWithParams(params, `${PREFIX}/${userId}/followers`);
  },
  following: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return buildUserBaseUrlWithParams(params, `${PREFIX}/${userId}/following`);
  },
  friends: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return buildUserBaseUrlWithParams(params, `${PREFIX}/${userId}/friends`);
  },
  muted: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return buildUserBaseUrlWithParams(params, `${PREFIX}/${userId}/muted`);
  },
  notifications: (params: Core.TUserPaginationParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return buildUserBaseUrlWithParams(params, `${PREFIX}/${userId}/notifications`);
  },
  relationship: (params: Core.TUserRelationshipParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    const viewerId = Core.encodePathSegment(params.viewer_id);
    return Core.buildNexusUrl(`${PREFIX}/${userId}/relationship/${viewerId}`);
  },
  taggers: (params: Core.TUserTaggersParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    const label = Core.encodePathSegment(params.label);
    return buildUserBaseUrlWithParams(params, `${PREFIX}/${userId}/taggers/${label}`);
  },
  tags: (params: Core.TUserTagsParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return buildUserBaseUrlWithParams(params, `${PREFIX}/${userId}/tags`);
  },
};
