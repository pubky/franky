import * as Core from '@/core';

export type TCreatePostParams = {
  parentPostId?: string;
  content: string;
  authorId: Core.Pubky;
};

export type TReadPostsParams = {
  limit?: number;
  offset?: number;
};

export type TDeleteParams = {
  postId: string;
  userId: Core.Pubky;
};
