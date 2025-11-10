import * as Core from '@/core';

/**
 * Parameters for upserting a following stream
 */
export type TFollowingStreamUpsertParams = {
  streamId: Core.UserStreamTypes;
  stream: Core.Pubky[];
};

/**
 * Parameters for reading a following stream chunk from cache
 */
export type TCacheFollowingStreamParams = {
  skip: number;
  limit: number;
  cachedStream: { stream: Core.Pubky[] };
};
