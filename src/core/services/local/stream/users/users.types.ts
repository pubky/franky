import * as Core from '@/core';

/**
 * Parameters for upserting a user stream (followers, following, friends, etc.)
 * streamId should be a composite ID in format 'userId:streamType' (e.g., 'user-ABC:followers')
 */
export type TUserStreamUpsertParams = {
  streamId: string;
  stream: Core.Pubky[];
};

/**
 * Parameters for reading a user stream chunk from cache
 */
export type TCacheUserStreamParams = {
  skip: number;
  limit: number;
  cachedStream: { stream: Core.Pubky[] };
};
