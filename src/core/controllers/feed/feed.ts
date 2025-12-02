import * as Core from '@/core';

export class FeedController {
  private constructor() {}

  static async create(params: Core.TFeedCreateParams): Promise<Core.FeedModelSchema> {
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();

    // Validate tags early to fail fast before normalization and persistence
    Core.FeedValidators.validateTags(params.tags);

    const normalizedFeed = Core.FeedNormalizer.to({ params, userId });

    Core.FeedValidators.validatePutParams({ feed: normalizedFeed });

    const feed = await Core.FeedApplication.persist({
      action: Core.HomeserverAction.PUT,
      userId,
      params: {
        feed: normalizedFeed,
      },
    });

    return feed!;
  }

  static async update(params: Core.TFeedUpdateParams): Promise<Core.FeedModelSchema> {
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();

    if (params.changes.tags) {
      Core.FeedValidators.validateTags(params.changes.tags);
    }

    const mergedParams = await Core.FeedApplication.prepareUpdateParams({
      feedId: params.feedId,
      changes: params.changes,
    });

    const normalizedFeed = Core.FeedNormalizer.to({ params: mergedParams, userId });

    Core.FeedValidators.validatePutParams({ feed: normalizedFeed, existingId: params.feedId });

    const feed = await Core.FeedApplication.persist({
      action: Core.HomeserverAction.PUT,
      userId,
      params: {
        feed: normalizedFeed,
        existingId: params.feedId,
      },
    });

    return feed!;
  }

  static async delete(params: Core.TFeedDeleteParams): Promise<void> {
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();

    Core.FeedValidators.validateDeleteParams({ feedId: params.feedId });

    await Core.FeedApplication.persist({
      action: Core.HomeserverAction.DELETE,
      userId,
      params: {
        feedId: params.feedId,
      },
    });
  }

  static async list(): Promise<Core.FeedModelSchema[]> {
    return Core.FeedApplication.list();
  }

  static async get(feedId: number): Promise<Core.FeedModelSchema | undefined> {
    return Core.FeedApplication.get(feedId);
  }
}
