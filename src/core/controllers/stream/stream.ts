import * as Core from '@/core';
import type { TReadStreamPostsParams } from './stream.types';

export class StreamController {
  private static isInitialized = false;

  private constructor() {} // Prevent instantiation

  /**
   * Initialize the controller
   */
  private static async initialize() {
    if (!this.isInitialized) {
      await Core.db.initialize();
      this.isInitialized = true;
    }
  }

  /**
   * Read post IDs from a stream with optional pagination
   * @param params - Parameters object
   * @param params.streamId - The stream identifier (e.g., PostStreamTypes.TIMELINE_ALL)
   * @param params.limit - Number of post IDs to fetch (default: 30)
   * @param params.offset - Number of post IDs to skip (default: 0)
   * @returns Array of post IDs
   */
  static async read({ streamId, limit = 30, offset = 0 }: TReadStreamPostsParams): Promise<string[]> {
    await this.initialize();

    // Fetch the stream from the database
    const stream = await Core.PostStreamModel.findById(streamId);

    if (!stream) {
      // Return empty array if stream doesn't exist
      return [];
    }

    // Apply pagination to the stream's post IDs and return them
    return stream.stream.slice(offset, offset + limit);
  }
}
