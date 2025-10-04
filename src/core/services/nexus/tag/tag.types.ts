import * as Core from '@/core';

export type TTagViewParams = {
  taggerId: Core.Pubky;
  tagId: string;
};

export type TTagHotParams = Core.TPaginationParams &
  Core.TUserStreamReachParams & {
    user_id?: string;
    taggers_limit?: number;
  };

export type TTagTaggersParams = Core.TPaginationParams &
  Core.TUserStreamReachParams & {
    label: string;
    user_id?: string;
  };

export const TAGS_PATH_PARAMS = ['label'] as const;

export type TTagsQueryParams = TTagHotParams | TTagTaggersParams;
