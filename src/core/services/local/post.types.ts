import * as Core from '@/core';

export type LocalFetchPostsParams = {
  limit?: number;
  offset?: number;
};

export type LocalReplyToPostParams = {
  parentPostId: string;
  replyDetails: Core.PostDetailsModelSchema;
};
