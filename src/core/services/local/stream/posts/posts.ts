import * as Core from '@/core';

/**
 * Local Stream Posts Service
 *
 * Simple service to manage post stream IDs in IndexDB.
 * Only stores arrays of post IDs, no post data or user data.
 */
export class LocalStreamPostsService {
  private constructor() {}

  /**
   * Save or update a stream of post IDs
   */
  static async upsert(streamId: Core.PostStreamTypes, stream: string[]): Promise<void> {
    await Core.PostStreamModel.upsert(streamId, stream);
  }

  /**
   * Get a stream of post IDs by stream ID
   */
  static async findById(streamId: Core.PostStreamTypes): Promise<{ stream: string[] } | null> {
    return await Core.PostStreamModel.findById(streamId);
  }

  /**
   * Delete a stream from cache
   */
  static async deleteById(streamId: Core.PostStreamTypes): Promise<void> {
    await Core.PostStreamModel.deleteById(streamId);
  }
}
