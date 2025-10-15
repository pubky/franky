import * as Core from '@/core';

export class StreamPostsController {
  private constructor() {} // Prevent instantiation

  /**
   * Read post IDs from a stream with optional pagination
   * @param params - Parameters object
   * @param params.streamId - The stream identifier (e.g., PostStreamTypes.TIMELINE_ALL)
   * @param params.limit - Number of post IDs to fetch (default: 30)
   * @param params.offset - Number of post IDs to skip (default: 0)
   * @returns Array of post IDs
   */
  static async read({ streamId, limit = 30, offset = 0 }: Core.TReadStreamPostsParams): Promise<string[]> {
    return await Core.PostStreamApplication.read({ streamId, limit, offset });
  }
}
