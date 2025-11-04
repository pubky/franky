import * as Core from '@/core';
import * as Config from '@/config';

export class StreamPostsController {
  private constructor() { } // Prevent instantiation

  // TODO-Question: Do we need another function for engagement streams? or we do it all in one.
  // If we separate concerns, we name it as getOrFetchStreamSliceByTimeline
  static async getOrFetchStreamSlice({
    streamId,
    post_id,
    timestamp: lastPostTimestamp,
    limit = Config.NEXUS_POSTS_PER_PAGE,
  }: Core.TReadStreamPostsParams): Promise<{ nextPageIds: string[], timestamp: number | undefined }> {
    //TODO: ViewerId, observerId, streamSorting, StreamOrder, StreamKind have to be fields that are part of the stream filter global state
    // From now, assume `timeline:all:all` but the function has to be generic for all streams.
    // Remember the engagement filter active, the behavour is different. We do not save any streams
    const { nextPageIds, cacheMissPostIds, timestamp } = await Core.PostStreamApplication.getOrFetchStreamSlice({ streamId, limit, post_id, timestamp: lastPostTimestamp });
    // Query nexus to get the cacheMissPostIds
    Core.PostStreamApplication.fetchMissingPostsFromNexus(cacheMissPostIds); //might be 2s to persist
    return { nextPageIds, timestamp };
  }
}