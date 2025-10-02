import * as Core from '@/core';

export type TUserDepthParams = {
  depth?: number;
  viewer_id?: Core.Pubky;
};

export type TUserParams = {
  user_id: Core.Pubky;
};

export type TUserViewParams = TUserDepthParams & TUserParams;

export type TUserPaginationParams = TUserParams &
  Core.TPaginationParams & {
    start: number;
    end: number;
  };

export type TUserRelationshipParams = TUserParams & {
  viewer_id: Core.Pubky;
};

export type TUserTaggersParams = TUserParams &
  Core.TPaginationParams &
  TUserDepthParams & {
    label: string;
  };

export type TUserTagsParams = TUserParams & Core.TTagsPaginationParams & TUserDepthParams & Core.TSkipTagsParams;

export type TUserQueryParams =
  | Core.TUserViewParams
  | Core.TUserPaginationParams
  | Core.TUserTaggersParams
  | Core.TUserTagsParams;

// Path parameters that should NOT be added to query string
export const USER_PATH_PARAMS = ['user_id', 'label'] as const;
