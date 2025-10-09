import * as Core from '@/core';

export type TCreateRepostParams = {
  originalPostId: string;
  userId: Core.Pubky;
  content?: string;
};

export type TDeleteRepostParams = {
  repostId: string;
  userId: Core.Pubky;
};
