import * as Core from '@/core';

/**
 * Parameters for reading a user stream chunk (followers, following, friends, etc.)
 */
export type TReadUserStreamChunkParams = {
  streamId: Core.UserStreamTypes;
  user_id: Core.Pubky;
  skip?: number;
  limit?: number;
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
