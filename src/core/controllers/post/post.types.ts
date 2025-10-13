import * as Core from '@/core';

export type TCreatePostParams = {
  parentPostId?: string;
  originalPostId?: string;
  content: string;
  kind?: Core.PubkyAppPostKind;
  authorId: Core.Pubky;
};

export type TReadPostsParams = {
  limit?: number;
  offset?: number;
};

export type TDeletePostParams = {
  postId: string;
  deleterId: Core.Pubky;
};
