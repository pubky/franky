import * as Core from '@/core';
import { PubkyAppPost } from 'pubky-app-specs';

export interface TCreatePostInput {
  postId: string;
  authorId: Core.Pubky;
  post: PubkyAppPost;
  postUrl: string;
  fileAttachments?: Core.TFileAttachmentResult[];
  tags?: Core.TCreateTagInput[];
}
