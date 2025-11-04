import * as Core from '@/core';

export type TReadStreamPostsParams = {
  streamId: Core.PostStreamTypes;
  post_id?: string;
  timestamp: number;
  limit?: number;
};

export type TPostPaginationResponse = {
  nextPageIds: string[];
  cacheMissPostIds: string[];
  timestamp: number | undefined;
}
