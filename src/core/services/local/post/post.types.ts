import * as Core from '@/core';

export type TLocalFetchPostsParams = {
  limit?: number;
  offset?: number;
};

export type TLocalReplyToPostParams = {
  parentPostId: string;
  replyDetails: Core.PostDetailsModelSchema;
};
