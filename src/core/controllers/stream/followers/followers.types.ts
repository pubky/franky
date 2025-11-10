import * as Core from '@/core';

/**
 * Re-export application layer types
 */
export type {
  TReadFollowersStreamChunkParams,
  TFollowersStreamChunkResponse,
  TMissingFollowersParams,
} from '@/core/application/stream/followers/followers.types';

/**
 * Response from reading a followers stream chunk
 * Simplified version for controller layer
 */
export type TReadFollowersStreamChunkResponse = {
  nextPageIds: Core.Pubky[];
  skip: number | undefined;
};
