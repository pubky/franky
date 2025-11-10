import * as Core from '@/core';

/**
 * Re-export application layer types
 */
export type {
  TReadFollowingStreamChunkParams,
  TFollowingStreamChunkResponse,
  TMissingFollowingParams,
} from '@/core/application/stream/following/following.types';

/**
 * Response from reading a following stream chunk
 * Simplified version for controller layer
 */
export type TReadFollowingStreamChunkResponse = {
  nextPageIds: Core.Pubky[];
  skip: number | undefined;
};
