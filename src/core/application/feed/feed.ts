import { feedUriBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import type { FeedDeleteParams, FeedPutParams, PersistAndSyncParams } from './feed.types';
import { HttpMethod } from '@/libs';


export class FeedApplication {
  private constructor() {}

  static async getList(): Promise<Core.FeedModelSchema[]> {
    return Core.LocalFeedService.readAll();
  }

  static async get(params: Core.TFeedIdParam): Promise<Core.FeedModelSchema> {
    return Core.LocalFeedService.read(params);
  }

  static async persist({ userId, params }: FeedPutParams): Promise<Core.FeedModelSchema> {
    const { feed, existingId } = params as Core.TFeedPersistCreateParams;
    const feedData = feed.feed;
    const feedConfig = feedData.feed;

    const now = Date.now();
    const createdAt = existingId
      ? (await Core.LocalFeedService.read({ feedId: existingId }).catch(() => ({ created_at: now }))).created_at
      : now;

    // For auto-incrementing IDs: use 0 for new feeds (Dexie will auto-generate), existing ID for updates
    const feedSchema: Core.FeedModelSchema = {
      id: existingId ?? 0,
      name: feedData.name,
      tags: feedConfig.tags ?? [],
      reach: feedConfig.reach,
      sort: feedConfig.sort,
      content: feedConfig.content ?? null,
      layout: feedConfig.layout,
      created_at: createdAt,
      updated_at: now,
    };

    return this.commit({ userId, feedSchema, normalizedFeed: feed });
  }

  static async commitDelete({ userId, params }: FeedDeleteParams): Promise<void> {
    // Convert numeric ID to string for URI builder
    const feedUrl = feedUriBuilder(userId, String((params as Core.TFeedPersistDeleteParams).feedId));

    await Promise.all([
      Core.LocalFeedService.delete({ feedId: (params as Core.TFeedPersistDeleteParams).feedId }),
      Core.HomeserverService.request(HttpMethod.DELETE, feedUrl),
    ]);
  }

  static async prepareUpdateParams({ feedId, changes }: Core.TFeedUpdateParams): Promise<Core.TFeedCreateParams> {
    const existing = await Core.LocalFeedService.read({ feedId });

    return {
      name: existing.name,
      tags: changes.tags ?? existing.tags,
      reach: changes.reach ?? existing.reach,
      sort: changes.sort ?? existing.sort,
      content: changes.content !== undefined ? changes.content : existing.content,
      layout: changes.layout ?? existing.layout,
    };
  }

  /**
   * Persist feed locally and sync to homeserver
   * Extracted to avoid duplication between handlePut and handleUpdate
   */
  private static async commit({
    userId,
    feedSchema,
    normalizedFeed,
  }: PersistAndSyncParams): Promise<Core.FeedModelSchema> {
    // Dexie auto-generates ID when id is 0, returns feed with actual ID
    const persistedFeed = await Core.LocalFeedService.createOrUpdate(feedSchema);

    // URI builder requires string IDs, but we store numeric IDs locally
    const feedUrl = feedUriBuilder(userId, String(persistedFeed.id));
    const feedJson = normalizedFeed.feed.toJson() as Record<string, unknown>;

    await Core.HomeserverService.request(HttpMethod.PUT, feedUrl, feedJson);

    return persistedFeed;
  }
}
