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
  /** Optional viewer ID for relationship data. Null/undefined for unauthenticated views. */
  viewerId?: Core.Pubky | null;
};
