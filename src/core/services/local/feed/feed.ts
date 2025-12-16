import * as Core from '@/core';
import * as Libs from '@/libs';

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

        const persistedFeed = await Core.FeedModel.createAndGet(feedWithoutId as Core.FeedModelSchema);

        if (!persistedFeed) {
          throw Libs.createDatabaseError(Libs.DatabaseErrorType.RECORD_NOT_FOUND, 'Feed not found', 404, {
            feedId: feed.id,
          });
        }
        return persistedFeed;
      }

      await Core.FeedModel.upsert(feed);
      const persistedFeed = await Core.FeedModel.findById(feed.id);
      if (!persistedFeed) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.RECORD_NOT_FOUND, 'Feed not found', 404, {
          feedId: feed.id,
        });
      }
      return persistedFeed;
    });
  }

  static async delete({ feedId }: Core.TFeedIdParam) {
    await Core.db.transaction('rw', FEED_TABLES, async () => {
      await Core.FeedModel.deleteById(feedId);
    });
  }

  static async read({ feedId }: Core.TFeedIdParam): Promise<Core.FeedModelSchema> {
    const feed = await Core.FeedModel.findById(feedId);
    if (!feed) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.RECORD_NOT_FOUND, 'Feed not found', 404, { feedId });
    }
    return feed;
  }

  static async readAll(): Promise<Core.FeedModelSchema[]> {
    return Core.FeedModel.findAllSorted();
  }
}
