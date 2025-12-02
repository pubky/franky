import { feedUriBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type { FeedDeleteParams, FeedPutParams, PersistAndSyncParams } from './feed.types';

export class FeedApplication {
  private constructor() {}

  static async persist({ action, userId, params }: Core.TFeedPersistInput): Promise<Core.FeedModelSchema | undefined> {
    if (action === Core.HomeserverAction.DELETE) {
      return this.handleDelete({ userId, params });
    }

    return this.handlePut({ userId, params });
  }

  private static async handleDelete({ userId, params }: FeedDeleteParams): Promise<undefined> {
    Core.FeedValidators.validateDeleteParams(params);

    // Convert numeric ID to string for URI builder
    const feedUrl = feedUriBuilder(userId, String(params.feedId));

    await Promise.all([
      Core.LocalFeedService.delete(params.feedId),
      Core.HomeserverService.request(Core.HomeserverAction.DELETE, feedUrl),
    ]);

    return undefined;
  }

  static async prepareUpdateParams({ feedId, changes }: Core.TFeedUpdateParams): Promise<Core.TFeedCreateParams> {
    const existing = await Core.LocalFeedService.findById(feedId);
    if (!existing) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.RECORD_NOT_FOUND, 'Feed not found', 404, { feedId });
    }

    return {
      name: existing.name,
      tags: changes.tags ?? existing.tags,
      reach: changes.reach ?? existing.reach,
      sort: changes.sort ?? existing.sort,
      content: changes.content !== undefined ? changes.content : existing.content,
      layout: changes.layout ?? existing.layout,
    };
  }

  private static async handlePut({ userId, params }: FeedPutParams): Promise<Core.FeedModelSchema> {
    Core.FeedValidators.validatePutParams(params);

    const { feed, existingId } = params;
    const feedData = feed.feed;
    const feedConfig = feedData.feed;

    const now = Date.now();
    const createdAt = existingId ? ((await Core.LocalFeedService.findById(existingId))?.created_at ?? now) : now;

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

    return this.persistAndSync({ userId, feedSchema, normalizedFeed: feed });
  }

  /**
   * Persist feed locally and sync to homeserver
   * Extracted to avoid duplication between handlePut and handleUpdate
   */
  private static async persistAndSync({
    userId,
    feedSchema,
    normalizedFeed,
  }: PersistAndSyncParams): Promise<Core.FeedModelSchema> {
    // Dexie auto-generates ID when id is 0, returns feed with actual ID
    const persistedFeed = await Core.LocalFeedService.persist(feedSchema);

    // URI builder requires string IDs, but we store numeric IDs locally
    const feedUrl = feedUriBuilder(userId, String(persistedFeed.id));
    const feedJson = normalizedFeed.feed.toJson() as Record<string, unknown>;

    await Core.HomeserverService.request(Core.HomeserverAction.PUT, feedUrl, feedJson);

    return persistedFeed;
  }

  static async list(): Promise<Core.FeedModelSchema[]> {
    return Core.LocalFeedService.findAll();
  }

  static async get(feedId: number): Promise<Core.FeedModelSchema | undefined> {
    return Core.LocalFeedService.findById(feedId);
  }
}
