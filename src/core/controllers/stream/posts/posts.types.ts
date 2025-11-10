import * as Core from '@/core';

export type TReadPostStreamChunkParams = {
  streamId: Core.PostStreamTypes;
  post_id?: string;
  timestamp?: number;
  limit?: number;
};

export type TReadPostStreamChunkResponse = {
  nextPageIds: string[];
  timestamp: number | undefined;
};
