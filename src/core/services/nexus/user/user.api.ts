import * as Core from '@/core';
/**
 * User API Endpoints
 *
 * All API endpoints related to user operations
 */

const PREFIX = 'v0/user';

export const userApi = {
  view: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return Core.buildUrlWithQuery({ baseRoute: `${PREFIX}/${userId}`, params, excludeKeys: Core.USER_PATH_PARAMS });
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
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/${userId}/followers`,
      params,
      excludeKeys: Core.USER_PATH_PARAMS,
    });
  },
  following: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/${userId}/following`,
      params,
      excludeKeys: Core.USER_PATH_PARAMS,
    });
  },
  friends: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/${userId}/friends`,
      params,
      excludeKeys: Core.USER_PATH_PARAMS,
    });
  },
  muted: (params: Core.TUserViewParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/${userId}/muted`,
      params,
      excludeKeys: Core.USER_PATH_PARAMS,
    });
  },
  notifications: (params: Core.TUserPaginationParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/${userId}/notifications`,
      params,
      excludeKeys: Core.USER_PATH_PARAMS,
    });
  },
  relationship: (params: Core.TUserRelationshipParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    const viewerId = Core.encodePathSegment(params.viewer_id);
    return Core.buildNexusUrl(`${PREFIX}/${userId}/relationship/${viewerId}`);
  },
  taggers: (params: Core.TUserTaggersParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    const label = Core.encodePathSegment(params.label);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/${userId}/taggers/${label}`,
      params,
      excludeKeys: Core.USER_PATH_PARAMS,
    });
  },
  tags: (params: Core.TUserTagsParams) => {
    const userId = Core.encodePathSegment(params.user_id);
    return Core.buildUrlWithQuery({
      baseRoute: `${PREFIX}/${userId}/tags`,
      params,
      excludeKeys: Core.USER_PATH_PARAMS,
    });
  },
};

export type UserApiEndpoint = keyof typeof userApi;
