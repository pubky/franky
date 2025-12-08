import * as Core from '@/core';

export interface TFetchStreamParams {
  streamId: Core.PostStreamId;
  streamHead: number;
  streamTail: number;
  limit: number;
  viewerId: Core.Pubky;
  lastPostId?: string;
  tags?: string[];
}

export interface TInitialStreamParams {
  streamId: Core.PostStreamId;
  limit: number;
  cachedStream: { stream: string[] } | null;
}

export interface TPostStreamChunkResponse {
  nextPageIds: string[];
  cacheMissPostIds: string[];
  timestamp: number | undefined;
}

export interface TPartialCacheHitParams {
  cachedStreamChunk: string[];
  limit: number;
  streamTail: number;
  streamId: Core.PostStreamId;
  viewerId: Core.Pubky;
}

export interface TMissingPostsParams {
  cacheMissPostIds: string[];
  viewerId: Core.Pubky;
}

export interface TCacheStreamParams {
  lastPostId: string | undefined;
  limit: number;
  cachedStream: { stream: string[] };
}

export interface TFetchMissingUsersParams {
  posts: Core.NexusPost[];
  viewerId: Core.Pubky;
}

export interface TPersistUnreadNewStreamChunkParams {
  streamId: Core.PostStreamId;
  compositePostIds: string[];
}

/**
 * Entry stored in the in-memory queue for overflow posts between pagination requests.
 * @property posts - Array of composite post IDs (authorPubky:postId) not yet returned to UI
 * @property cursor - The last timestamp used for pagination
 */
export interface TQueueEntry {
  posts: string[];
  cursor: number;
}
