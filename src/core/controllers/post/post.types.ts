import * as Core from '@/core';

export type TAddReplyParams = {
  parentPostId: string;
  content: string;
  authorId: Core.Pubky;
};

export type TFetchPostsParams = {
  limit?: number;
  offset?: number;
};
