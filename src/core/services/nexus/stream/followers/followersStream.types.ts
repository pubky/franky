import * as Core from '@/core';

/**
 * Parameters for fetching followers stream from Nexus
 */
export type TFetchFollowersStreamParams = {
  streamId: Core.UserStreamTypes;
  user_id: Core.Pubky;
  params: {
    skip: number;
    limit: number;
  };
};
