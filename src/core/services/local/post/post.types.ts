import * as Core from '@/core';

export type TLocalFetchPostsParams = {
  limit?: number;
  offset?: number;
};

export type TLocalSavePostParams = {
  postId: string;
  content: string;
  kind: Core.NexusPostKind;
  authorId: Core.Pubky;
  parentUri?: string;
  attachments?: string[];
  repostedUri?: string;
};

export type TLocalDeleteRepostParams = {
  repostId: string;
  userId: Core.Pubky;
  repostedUri: string;
};

export type TLocalDeletePostParams = {
  postId: string;
  userId: Core.Pubky;
  parentUri?: string;
  repostedUri?: string;
};
