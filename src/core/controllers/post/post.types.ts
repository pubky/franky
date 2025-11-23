import * as Core from '@/core';

export type TCreatePostParams = {
  authorId: Core.Pubky;
  content: string;
  kind?: Core.PubkyAppPostKind;
  tags?: string[];
  attachments?: File[];
  parentPostId?: string;
  originalPostId?: string;
};

export type TDeletePostParams = {
  postId: string;
  deleterId: Core.Pubky;
};
