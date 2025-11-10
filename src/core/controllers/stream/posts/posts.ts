import * as Core from '@/core';
import * as Config from '@/config';

export class StreamPostsController {
  private constructor() {} // Prevent instantiation

  // TODO-Question: Do we need another function for engagement streams? or we do it all in one.
  // If we separate concerns, we name it as getOrFetchStreamSliceByTimeline
  static async getOrFetchStreamSlice({
    streamId,
    post_id,
    timestamp: lastPostTimestamp,
    limit = Config.NEXUS_POSTS_PER_PAGE,
  }: Core.TReadPostStreamChunkParams): Promise<Core.TReadPostStreamChunkResponse> {
    //TODO: ViewerId, observerId, streamSorting, StreamOrder, StreamKind have to be fields that are part of the stream filter global state
    // From now, assume `timeline:all:all` but the function has to be generic for all streams.
    // Remember the engagement filter active, the behavior is different. We do not save any streams
    const { nextPageIds, cacheMissPostIds, timestamp } = await Core.PostStreamApplication.getOrFetchStreamSlice({
      streamId,
      limit,
      post_id,
      timestamp: lastPostTimestamp,
    });
    // Query nexus to get the cacheMissPostIds
    if (cacheMissPostIds.length > 0) {
      const viewerId = Core.useAuthStore.getState().selectCurrentUserPubky();
      await Core.PostStreamApplication.fetchMissingPostsFromNexus({ cacheMissPostIds, viewerId }); //might be 2s to persist
    }
    return { nextPageIds, timestamp };
  }
}
