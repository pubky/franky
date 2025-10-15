import * as Core from '@/core';
import { PubkyAppPost } from 'pubky-app-specs';

export type TCreatePostInput = {
  postId: string;
  authorId: Core.Pubky;
  post: PubkyAppPost;
  postUrl: string;
};
