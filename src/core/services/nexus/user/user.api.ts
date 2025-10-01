import * as Core from '@/core';
/**
 * User API Endpoints
 *
 * All API endpoints related to user operations
 */

const PREFIX = 'user';

export function buildUserBaseUrlWithParams(
  optParams: Omit<Record<string, unknown>, 'user_id'>,
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

export const USER_API = {
  view: (params: Core.TUserViewParams) => buildUserBaseUrlWithParams(params, `${PREFIX}/${params.user_id}`),
  counts: (params: Core.TUserParams) => Core.buildNexusUrl(`${PREFIX}/${params.user_id}/counts`),
  details: (params: Core.TUserParams) => Core.buildNexusUrl(`${PREFIX}/${params.user_id}/details`),
  followers: (params: Core.TUserViewParams) =>
    buildUserBaseUrlWithParams(params, `${PREFIX}/${params.user_id}/followers`),
  following: (params: Core.TUserViewParams) =>
    buildUserBaseUrlWithParams(params, `${PREFIX}/${params.user_id}/following`),
  friends: (params: Core.TUserViewParams) => buildUserBaseUrlWithParams(params, `${PREFIX}/${params.user_id}/friends`),
  muted: (params: Core.TUserViewParams) => buildUserBaseUrlWithParams(params, `${PREFIX}/${params.user_id}/muted`),
  notifications: (params: Core.TUserPaginationParams) =>
    buildUserBaseUrlWithParams(params, `${PREFIX}/${params.user_id}/notifications`),
  relationship: (params: Core.TUserRelationshipParams) =>
    Core.buildNexusUrl(`${PREFIX}/${params.user_id}/relationship/${params.viewer_id}`),
  taggers: (params: Core.TUserTaggersParams) =>
    buildUserBaseUrlWithParams(params, `${PREFIX}/${params.user_id}/taggers/${params.label}`),
  tags: (params: Core.TUserTagsParams) => buildUserBaseUrlWithParams(params, `${PREFIX}/${params.user_id}/tags`),
};
