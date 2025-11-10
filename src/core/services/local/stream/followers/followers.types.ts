import * as Core from '@/core';

/**
 * Parameters for upserting a followers stream
 */
export type TFollowersStreamUpsertParams = {
  streamId: Core.UserStreamTypes;
  stream: Core.Pubky[];
};

/**
 * Parameters for reading a followers stream chunk from cache
 */
export type TCacheFollowersStreamParams = {
  skip: number;
  limit: number;
  cachedStream: { stream: Core.Pubky[] };
};
