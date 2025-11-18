import * as Core from '@/core';

export type TFetchStreamParams = {
  streamId: Core.PostStreamId;
  streamTail: number;
  limit: number;
  viewerId: Core.Pubky;
  lastPostId?: string;
  tags?: string[];
};

export type TInitialStreamParams = {
  streamId: Core.PostStreamId;
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
  lastPostId: string | undefined;
  limit: number;
  cachedStream: { stream: string[] };
};

export type TFetchMissingUsersParams = {
  posts: Core.NexusPost[];
  viewerId: Core.Pubky;
};
