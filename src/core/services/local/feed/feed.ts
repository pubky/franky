import * as Core from '@/core';

const FEED_TABLES = [Core.FeedModel.table];

export class LocalFeedService {
  private constructor() {}

  /**
   * Persist a feed to local storage and return the persisted feed with the actual ID
   * Uses table.add() for new feeds (id = 0) to trigger Dexie auto-increment, upsert() for updates
   */
  static async createOrUpdate(feed: Core.FeedModelSchema): Promise<Core.FeedModelSchema> {
    return await Core.db.transaction('rw', FEED_TABLES, async () => {
      if (feed.id === 0) {
        // For new records: omit id to trigger Dexie auto-increment (++id schema)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...feedWithoutId } = feed;
        return Core.FeedModel.createAndGet(feedWithoutId as Core.FeedModelSchema);
      }

      await Core.FeedModel.upsert(feed);
      return Core.FeedModel.findByIdOrThrow(feed.id);
    });
  }

  static async delete({ feedId }: Core.TFeedIdParam) {
    await Core.db.transaction('rw', FEED_TABLES, async () => {
      await Core.FeedModel.deleteById(feedId);
    });
  }

  /**
   * Read a feed by ID. Throws RECORD_NOT_FOUND if feed doesn't exist.
   */
  static async read({ feedId }: Core.TFeedIdParam): Promise<Core.FeedModelSchema> {
    return Core.FeedModel.findByIdOrThrow(feedId);
  }

  static async readAll(): Promise<Core.FeedModelSchema[]> {
    return Core.FeedModel.findAllSorted();
  }
}
