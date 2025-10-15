import * as Core from '@/core';
import { PubkyAppPost } from 'pubky-app-specs';

export type TLocalFetchPostsParams = {
  limit?: number;
  offset?: number;
};

export type TLocalSavePostParams = {
  postId: string;
  authorId: Core.Pubky;
  post: PubkyAppPost;
};
