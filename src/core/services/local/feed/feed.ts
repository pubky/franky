import * as Core from '@/core';

const FEED_TABLES = [Core.FeedModel.table];

export class LocalFeedService {
  private constructor() {}

  /**
   * Persist a feed to local storage
   */
  static async persist(feed: Core.FeedModelSchema): Promise<void> {
    await Core.db.transaction('rw', FEED_TABLES, async () => {
      await Core.FeedModel.upsert(feed);
    });
  }

  /**
   * Delete a feed from local storage
   */
  static async delete(feedId: string): Promise<void> {
    await Core.db.transaction('rw', FEED_TABLES, async () => {
      await Core.FeedModel.deleteById(feedId);
    });
  }

  /**
   * Find a feed by ID
   */
  static async findById(feedId: string): Promise<Core.FeedModelSchema | undefined> {
    return Core.FeedModel.table.get(feedId);
  }

  /**
   * Find all feeds sorted by creation time
   */
  static async findAll(): Promise<Core.FeedModelSchema[]> {
    return Core.FeedModel.findAllSorted();
  }
}
