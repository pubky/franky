import * as Core from '@/core';

export type TCreateRepostInput = {
  postId: string;
  content: string;
  authorId: Core.Pubky;
  postUrl: string;
  postJson: Record<string, unknown>;
  repostedUri: string;
  attachments?: string[];
};

export type TDeleteRepostInput = {
  repostId: string;
  userId: Core.Pubky;
  repostedUri: string;
  repostUrl: string;
};
