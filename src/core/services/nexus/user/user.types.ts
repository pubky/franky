import * as Core from '@/core';

export type TUserDepthParams = {
  depth?: number;
  viewer_id?: Core.Pubky;
};

export type TUserViewParams = TUserDepthParams & Core.TUserId;

export type TUserPaginationParams = Core.TUserId & Core.TPaginationParams & Core.TPaginationRangeParams;

export type TUserRelationshipParams = Core.TUserId & {
  viewer_id: Core.Pubky;
};

export type TUserTaggersParams = Core.TUserId &
  Core.TPaginationParams &
  TUserDepthParams & {
    label: string;
  };

export type TUserTagsParams = Core.TUserId & Core.TTagsPaginationParams & TUserDepthParams & Core.TSkipTagsParams;

export type TUserQueryParams =
  | Core.TUserViewParams
  | Core.TUserPaginationParams
  | Core.TUserTaggersParams
  | Core.TUserTagsParams;

// Path parameters that should NOT be added to query string
export const USER_PATH_PARAMS = ['user_id', 'label'] as const;
