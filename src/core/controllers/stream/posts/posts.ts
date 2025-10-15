import * as Core from '@/core';

export class StreamPostsController {
  private constructor() {} // Prevent instantiation

  /**
   * Get or fetch post IDs from a stream with optional pagination
   * @param params - Parameters object
   * @param params.streamId - The stream identifier (e.g., PostStreamTypes.TIMELINE_ALL)
   * @param params.limit - Number of post IDs to fetch (default: 30)
   * @param params.skip - Number of post IDs to skip (default: 0)
   * @returns Array of post IDs
   */
  static async getOrFetchStreamSlice({
    streamId,
    limit = 30,
    skip = 0,
  }: Core.TReadStreamPostsParams): Promise<string[]> {
    return await Core.PostStreamApplication.getOrFetchStreamSlice({ streamId, limit, skip });
  }
}
