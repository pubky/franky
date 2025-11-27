import * as Core from '@/core';
import * as Config from '@/config';

// -=-=-=-=-=-=-=-=-=-=-=-=-=- POPULARITY STREAMS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// If we are in engagement mode, we might not have background live updates. There is no
// identifier to fetch updates from redis. Always the top post has the max engagement
// when we render the first 10. In engagement mode, we use skip to paginate, not the score.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=--=-=-

// -=-=-=-=-=-=-=-=-=-=-=-=-= OBSERVER ID =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// We can clone the same behavior of profile. To see an external user post stream, the url
// of streams should be /home/[external_user_id]. If we want logged user post stream,
// the url of streams should be /home.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export class StreamPostsController {
  private constructor() {} // Prevent instantiation

  /**
   * Retrieves or fetches a slice of posts from a stream.
   *
   * @param params - Parameters for the stream slice request
   * @param params.streamId - Unique identifier for the stream (e.g., 'timeline:all:all', 'engagement:all:images')
   * @param params.streamHead - Identifier of the  newest post in the current page for pagination. timestamp (timeline mode) or skip (engagement mode)
   * @param params.streamTail - Identifier of the last post in the current page for pagination. timestamp (timeline mode) or skip (engagement mode)
   * @param params.lastPostId - Post ID of the last post in the current page. We use to get the chunk of the stream from the cache.
   * @param params.limit - Limit of posts to fetch. Default is Config.NEXUS_POSTS_PER_PAGE.
   *
   * @returns Promise resolving to stream slice response containing:
   * - nextPageIds: Array of post IDs for the current page
   * - timestamp: Timestamp for pagination of the next page
   *
   * // Get next page using the last post ID
   * const nextPage = await StreamPostsController.getOrFetchStreamSlice({
   *   streamId: 'timeline:all:all',
   *   streamTail: 1762843325,
   *   lastPostId: 'user_id:post_id',
   * });
   * // Get next page (5th page) of engagement stream
   * const nextPage = await StreamPostsController.getOrFetchStreamSlice({
   *   streamId: 'engagement:all:images',
   *   streamTail: 40
   * });
   * ```
   */
  static async getOrFetchStreamSlice({
    streamId,
    streamHead = 0,
    streamTail = 0,
    lastPostId,
    limit = Config.NEXUS_POSTS_PER_PAGE,
  }: Core.TReadPostStreamChunkParams): Promise<Core.TReadPostStreamChunkResponse> {
    const viewerId = Core.useAuthStore.getState().selectCurrentUserPubky();
    const { nextPageIds, cacheMissPostIds, timestamp } = await Core.PostStreamApplication.getOrFetchStreamSlice({
      streamId,
      limit,
      streamHead,
      streamTail,
      lastPostId,
      viewerId,
    });
    // Query nexus to get the cacheMissPostIds
    if (cacheMissPostIds.length > 0) {
      void Core.PostStreamApplication.fetchMissingPostsFromNexus({ cacheMissPostIds, viewerId }); //might be 2s to persist
    }
    return { nextPageIds, timestamp };
  }

  /**
   * Gets the timestamp of the last cached post in a stream.
   *
   * Extracts the indexed_at timestamp from the oldest post in the cached stream.
   * Returns 0 if no cached stream exists or if the last post's details cannot be found.
   *
   * @param streamId - The ID of the post stream to query
   * @returns Promise resolving to the timestamp (number) or 0 if not found
   */
  static async getCachedLastPostTimestamp(params: Core.TStreamIdParams): Promise<number> {
    return await Core.PostStreamApplication.getCachedLastPostTimestamp(params);
  }

  /**
   *
   * The "head" refers to the first post in the stream array, which represents
   * the most recently indexed post. For reply streams without a cached head,
   * returns 1 if replies exist, otherwise 0.
   *
   * @param streamId - The stream ID to get the head timestamp for
   * @returns The indexed_at timestamp of the head post, or 0 if the stream is empty or head post not found
   */
  static async getStreamHead(params: Core.TStreamIdParams): Promise<number> {
    return await Core.PostStreamApplication.getStreamHead(params);
  }
}
