import * as Core from '@/core';
import { PubkyAppPost } from 'pubky-app-specs';

export interface TCreatePostInput extends Core.TLocalSavePostParams {
  postUrl: string;
  fileAttachments?: Core.TFileAttachmentResult[];
  tags?: Core.TCreateTagInput[];
}

export interface TEditPostInput {
  compositePostId: string;
  post: PubkyAppPost;
  postUrl: string;
}

export type TGetOrFetchPostParams = {
  compositeId: string;
  viewerId: Core.Pubky;
};
