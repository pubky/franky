import * as Core from '@/core';
import { PubkyAppPost } from 'pubky-app-specs';

export type TLocalSavePostParams = {
  postId: string;
  authorId: Core.Pubky;
  post: PubkyAppPost;
};

export type TLocalUpdatePostStreamParams = {
  authorId: Core.Pubky;
  postId: string;
  kind: string;
  parentUri?: string;
  ops: Promise<unknown>[];
  action: Core.HomeserverAction.PUT | Core.HomeserverAction.DELETE;
};
