import * as Core from '@/core';

/**
 * Parameters for reading a followers stream chunk
 */
export type TReadFollowersStreamChunkParams = {
  streamId: Core.UserStreamTypes;
  user_id: Core.Pubky;
  skip?: number;
  limit: number;
};

/**
 * Response from reading a followers stream chunk
 */
export type TFollowersStreamChunkResponse = {
  nextPageIds: Core.Pubky[];
  cacheMissUserIds: Core.Pubky[];
  skip: number | undefined;
};

/**
 * Parameters for fetching missing users
 */
export type TMissingFollowersParams = {
  cacheMissUserIds: Core.Pubky[];
  viewerId?: Core.Pubky;
};
