import * as Core from '@/core';

export type TStreamPostsParams = {
  streamId: Core.PostStreamTypes;
  limit?: number;
  offset?: number;
};
