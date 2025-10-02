import * as Core from '@/core';

export type AddReplyParams = {
  parentPostId: string;
  content: string;
  authorId: Core.Pubky;
};

export type FetchPostsParams = {
  limit?: number;
  offset?: number;
};
