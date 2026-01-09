import * as Core from '@/core';

export type TReadPostStreamChunkParams = {
  streamId: Core.PostStreamId;
  streamHead?: number;
  streamTail?: number;
  lastPostId?: string;
  tags?: string[];
  limit?: number;
  /** Order of results: 'ascending' (oldest first) or 'descending' (newest first, default) */
  order?: Core.StreamOrder;
};

export type TStreamIdParams = {
  streamId: Core.PostStreamId;
};

export type TReadPostStreamChunkResponse = {
  nextPageIds: string[];
  timestamp: number | undefined;
  /** True only if we've reached the actual end of the stream.
   * False if we hit MAX_FETCH_ITERATIONS or filled the limit. */
  reachedEnd?: boolean;
};
