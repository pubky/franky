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

export type TUserTagsParams = TUserParams &
  Core.TTagsPaginationParams &
  TUserDepthParams & {
    skip_tags?: number;
  };
