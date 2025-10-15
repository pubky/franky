import * as Core from '@/core';
import { PubkyAppPost } from 'pubky-app-specs';

export type TLocalSavePostParams = {
  postId: string;
  authorId: Core.Pubky;
  post: PubkyAppPost;
};
