import * as Core from '@/core';

export type TPostBase = {
  author_id: Core.Pubky;
  post_id: string;
  viewer_id?: Core.Pubky;
};

// Specific parameter types for each source
export type TPostViewParams = TPostBase & Core.TTagsPaginationParams;

export type TPostTaggersParams = TPostBase & {
  label: string;
  skip?: number;
  limit?: number;
};

export type TPostTagsParams = TPostViewParams & {
  skip_tags?: number;
};
