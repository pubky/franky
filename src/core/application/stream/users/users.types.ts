import * as Core from '@/core';

/**
 * Parameters for reading a user stream chunk (followers, following, friends, etc.)
 * streamId can be:
 * - A composite ID (userId:reach) e.g., 'user123:followers', 'user456:following'
 * - A UserStreamType (source:timeframe:reach) e.g., 'influencers:today:all', 'recommended:all:all'
 * viewerId: The current authenticated user (for relationship data)
 */
export type TReadUserStreamChunkParams = {
  streamId: Core.UserStreamId;
  skip: number;
  limit: number;
  viewerId?: Core.Pubky;
};

/**
 * Response from reading a user stream chunk
 */
export type TReadUserStreamChunkResponse = {
  nextPageIds: Core.Pubky[];
  skip: number | undefined;
};

/**
 * Internal response type with cache miss tracking
 */
export type TUserStreamChunkResponse = {
  nextPageIds: Core.Pubky[];
  cacheMissUserIds: Core.Pubky[];
  skip: number | undefined;
};

/**
 * Parameters for fetching missing users
 */
export type TMissingUsersParams = {
  cacheMissUserIds: Core.Pubky[];
  viewerId?: Core.Pubky;
};
