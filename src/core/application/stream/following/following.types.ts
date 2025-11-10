import * as Core from '@/core';

/**
 * Parameters for reading a following stream chunk
 */
export type TReadFollowingStreamChunkParams = {
  streamId: Core.UserStreamTypes;
  user_id: Core.Pubky;
  skip?: number;
  limit: number;
};

/**
 * Response from reading a following stream chunk
 */
export type TFollowingStreamChunkResponse = {
  nextPageIds: Core.Pubky[];
  cacheMissUserIds: Core.Pubky[];
  skip: number | undefined;
};

/**
 * Parameters for fetching missing users
 */
export type TMissingFollowingParams = {
  cacheMissUserIds: Core.Pubky[];
  viewerId?: Core.Pubky;
};
