import * as Core from '@/core';

export type TReadStreamPostsParams = {
  streamId: Core.PostStreamTypes;
  limit?: number;
  post_id?: string; // Cursor for pagination - composite ID of the last post
  timestamp?: number; // Timestamp for cursor-based pagination from Nexus
};
