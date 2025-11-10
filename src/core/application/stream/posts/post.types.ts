import * as Core from '@/core';

export type TInitialStreamParams = {
  streamId: Core.PostStreamTypes;
  limit: number;
  cachedStream: { stream: string[] } | null;
};

export type TPostStreamChunkResponse = {
  nextPageIds: string[];
  cacheMissPostIds: string[];
  timestamp: number | undefined;
};

export type TMissingPostsParams = {
  cacheMissPostIds: string[];
  viewerId: Core.Pubky;
};

export type TCacheStreamParams = {
  postId: string | undefined;
  limit: number;
  cachedStream: { stream: string[] };
};
