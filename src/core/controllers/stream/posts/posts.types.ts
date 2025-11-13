import * as Core from '@/core';

export type TReadPostStreamChunkParams = {
  streamId: Core.PostStreamTypes;
  streamTail: number;
  lastPostId?: string;
  tags?: string[];
};

export type TReadPostStreamChunkResponse = {
  nextPageIds: string[];
  timestamp: number | undefined;
};
