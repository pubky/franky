import * as Core from '@/core';
import { PubkyAppPost } from 'pubky-app-specs';

export interface TLocalSavePostParams {
  compositePostId: string;
  post: PubkyAppPost;
}

export interface TLocalUpdatePostStreamParams {
  compositePostId: string;
  kind: string;
  parentUri?: string;
  ops: Promise<unknown>[];
  action: Core.HomeserverAction.PUT | Core.HomeserverAction.DELETE;
}