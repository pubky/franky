import * as Core from '@/core';

export type TBookmarkEventParams = {
  userId: Core.Pubky; // Still needed for generating homeserver URI
  postId: string; // Composite post ID (authorId:postId)
};
