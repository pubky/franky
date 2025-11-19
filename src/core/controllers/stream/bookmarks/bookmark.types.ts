import * as Core from '@/core';

export type TBookmarkEventParams = {
  userId: Core.Pubky;
  postId: string; // Composite post ID (authorId:postId)
};
