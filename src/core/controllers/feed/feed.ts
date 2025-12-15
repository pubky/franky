import * as Core from '@/core';

export class FeedController {
  private constructor() {}

  /**
   * Get the list of feeds
   * @returns The list of feeds
   */
  static async getList(): Promise<Core.FeedModelSchema[]> {
    return Core.FeedApplication.getList();
  }

  /**
   * Get a feed by ID
   * @param feedId - The ID of the feed
   * @returns The feed or undefined if not found
   */
  static async get(feedId: number): Promise<Core.FeedModelSchema | undefined> {
    return Core.FeedApplication.get(feedId);
  }

  /**
   * Commit the create feed operation, this will persist the feed to the local database and sync to the homeserver.
   * @param params - The parameters object
   * @param params.tags - The tags for the feed
   * @returns The created feed
   */
  static async commitCreate(params: Core.TFeedCreateParams): Promise<Core.FeedModelSchema> {
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();

    // Validate tags early to fail fast before normalization and persistence
    Core.FeedValidators.validateTags(params.tags);

    const normalizedFeed = Core.FeedNormalizer.to({ params, userId });

    Core.FeedValidators.validatePutParams({ feed: normalizedFeed });

    const feed = await Core.FeedApplication.persist({ userId, params: { feed: normalizedFeed } });

    return feed!;
  }

  /**
   * Commit the update feed operation, this will persist the feed to the local database and sync to the homeserver.
   * @param params - The parameters object
   * @param params.feedId - The ID of the feed
   * @param params.changes - The changes to the feed
   * @returns The updated feed
   */
  static async commitUpdate(params: Core.TFeedUpdateParams): Promise<Core.FeedModelSchema> {
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
      userId,
      params: { feed: normalizedFeed, existingId: params.feedId },
    });

    return feed!;
  }

  /**
   * Commit the delete feed operation, this will delete the feed from the local database and sync to the homeserver.
   * @param params - The parameters object
   * @param params.feedId - The ID of the feed
   * @returns void
   */
  static async commitDelete(params: Core.TFeedDeleteParams): Promise<void> {
    const userId = Core.useAuthStore.getState().selectCurrentUserPubky();
    Core.FeedValidators.validateDeleteParams({ feedId: params.feedId });
    await Core.FeedApplication.commitDelete({ userId, params: { feedId: params.feedId } });
  }
}
