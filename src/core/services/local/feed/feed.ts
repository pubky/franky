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
        const newId = await Core.FeedModel.table.add(feedWithoutId as Core.FeedModelSchema);
        const persistedFeed = await Core.FeedModel.table.get(newId);
        if (!persistedFeed) {
          throw new Error('Failed to retrieve persisted feed');
        }
        return persistedFeed;
      }

      await Core.FeedModel.upsert(feed);
      const persistedFeed = await Core.FeedModel.table.get(feed.id);
      if (!persistedFeed) {
        throw new Error('Failed to retrieve persisted feed');
      }
      return persistedFeed;
    });
  }

  static async delete({ feedId }: Core.TFeedIdParam): Promise<void> {
    await Core.db.transaction('rw', FEED_TABLES, async () => {
      await Core.FeedModel.deleteById(feedId);
    });
  }

  static async read({ feedId }: Core.TFeedIdParam): Promise<Core.FeedModelSchema | undefined> {
    return Core.FeedModel.table.get(feedId);
  }

  static async readAll(): Promise<Core.FeedModelSchema[]> {
    return Core.FeedModel.findAllSorted();
  }
}
