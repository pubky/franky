import * as Core from '@/core';

/**
 * Parameters for fetching following stream from Nexus
 */
export type TFetchFollowingStreamParams = {
  streamId: Core.UserStreamTypes;
  user_id: Core.Pubky;
  params: {
    skip: number;
    limit: number;
  };
};
