import { feedUriBuilder } from 'pubky-app-specs';
import * as Core from '@/core';

export class FeedApplication {
  private constructor() {}

  static async persist(
    action: Core.HomeserverAction,
    params: Core.TFeedPersistParams,
  ): Promise<Core.FeedModelSchema | undefined> {
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    switch (action) {
      case Core.HomeserverAction.DELETE:
        return this.handleDelete(userId, params);
      case Core.HomeserverAction.PUT:
        return this.handlePut(userId, params);
    }
  }

  private static async handleDelete(userId: string, params: Core.TFeedPersistParams): Promise<undefined> {
    if (!Core.isFeedDeleteParams(params)) {
      throw new Error('Invalid params for DELETE action');
    }

    const feedUrl = feedUriBuilder(userId, params.feedId);

    await Promise.all([
      Core.LocalFeedService.delete(params.feedId),
      Core.HomeserverService.request(Core.HomeserverAction.DELETE, feedUrl),
    ]);

    return undefined;
  }

  private static async handlePut(userId: string, params: Core.TFeedPersistParams): Promise<Core.FeedModelSchema> {
    if (Core.isFeedDeleteParams(params)) {
      throw new Error('Invalid params for PUT action');
    }

    const { params: createParams, layout, existingId } = params;
    const { feed, meta } = Core.FeedNormalizer.to(createParams, userId);
    const feedConfig = feed.feed;

    const now = Date.now();
    const createdAt = existingId ? ((await Core.LocalFeedService.findById(existingId))?.created_at ?? now) : now;

    const feedSchema: Core.FeedModelSchema = {
      id: existingId ?? meta.id,
      name: feed.name,
      tags: feedConfig.tags ?? [],
      reach: feedConfig.reach,
      sort: feedConfig.sort,
      content: feedConfig.content ?? null,
      layout: layout,
      created_at: createdAt,
      updated_at: now,
    };

    const feedUrl = feedUriBuilder(userId, feedSchema.id);
    const feedJson = feed.toJson() as Record<string, unknown>;

    await Promise.all([
      Core.LocalFeedService.persist(feedSchema),
      Core.HomeserverService.request(Core.HomeserverAction.PUT, feedUrl, feedJson),
    ]);

    return feedSchema;
  }
}
