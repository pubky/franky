import * as Core from '@/core';

export type TReadPostStreamChunkParams = {
  streamId: Core.PostStreamId;
  streamHead?: number;
  streamTail?: number;
  lastPostId?: string;
  tags?: string[];
  limit?: number;
};

export type TReadPostStreamChunkResponse = {
  nextPageIds: string[];
  timestamp: number | undefined;
};
