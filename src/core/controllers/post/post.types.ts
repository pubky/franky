import * as Core from '@/core';

export type TCreatePostParams = {
  parentPostId?: string;
  content: string;
  authorId: Core.Pubky;
};
