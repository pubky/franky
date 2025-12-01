import * as Core from '@/core';

export type TCompositeId = {
  compositeId: string;
};

export type TPostBasePathParams = {
  author_id: Core.Pubky;
  post_id: string;
};

export type TPostBase = TPostBasePathParams & {
  viewer_id?: Core.Pubky;
};

// Specific parameter types for each source
export type TPostViewParams = TPostBase & Core.TTagsPaginationParams;

export type TPostTaggersParams = TPostBase &
  Core.TPaginationParams & {
    label: string;
  };

export type TPostTagsParams = TPostViewParams & Core.TSkipTagsParams;

export type TPostQueryParams = Core.TPostViewParams | Core.TPostBase | Core.TPostTaggersParams | Core.TPostTagsParams;

// Path parameters that should NOT be added to query string
export const POST_PATH_PARAMS = ['author_id', 'post_id', 'label'] as const;
