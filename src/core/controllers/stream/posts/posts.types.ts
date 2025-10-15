import * as Core from '@/core';

export type TReadStreamPostsParams = {
  streamId: Core.PostStreamTypes;
  limit?: number;
  offset?: number;
};
