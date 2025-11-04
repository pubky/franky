import * as Core from '@/core';
import * as Config from '@/config';

export class StreamPostsController {
  private constructor() {} // Prevent instantiation

  /**
   * Get or fetch post IDs from a stream with cursor-based pagination
   *
   * @param params - Parameters object
   * @param params.streamId - The stream identifier (e.g., PostStreamTypes.TIMELINE_ALL)
   * @param params.limit - Number of post IDs to fetch (default: POSTS_PER_PAGE)
   * @param params.post_id - Cursor for pagination - composite ID of the last post
   * @param params.timestamp - Timestamp for cursor-based pagination from Nexus
   * @returns Array of post composite IDs
   */
  static async getOrFetchStreamSlice({
    streamId,
    limit = Config.NEXUS_POSTS_PER_PAGE,
    post_id,
    timestamp,
  }: Core.TReadStreamPostsParams): Promise<string[]> {
    return await Core.PostStreamApplication.getOrFetchStreamSlice({ streamId, limit, post_id, timestamp });
  }
}
