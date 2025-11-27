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

    if (action === Core.HomeserverAction.DELETE) {
      if (!Core.isFeedDeleteParams(params)) {
        throw new Error('Invalid params for DELETE action');
      }

      const feedUrl = feedUriBuilder(userId, params.feedId);

      await Promise.all([Core.LocalFeedService.delete(params.feedId), Core.HomeserverService.request(action, feedUrl)]);

      return undefined;
    }

    if (!Core.isFeedDeleteParams(params)) {
      const { params: createParams, layout, existingId } = params;

      const feedResult = Core.FeedNormalizer.to(createParams, userId);
      const { feed, meta } = feedResult;
      const feedConfig = feed.feed;

      const now = Date.now();

      // Preserve original created_at when updating
      let createdAt = now;
      if (existingId) {
        const existing = await Core.LocalFeedService.findById(existingId);
        if (existing) {
          createdAt = existing.created_at;
        }
      }

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
        Core.HomeserverService.request(action, feedUrl, feedJson),
      ]);

      return feedSchema;
    }

    throw new Error('Invalid params for PUT action');
  }
}
