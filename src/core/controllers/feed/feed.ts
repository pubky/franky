import * as Core from '@/core';

export class FeedController {
  private constructor() {}

  static async create(params: Core.TFeedCreateParams): Promise<Core.FeedModelSchema> {
    const feed = await Core.FeedApplication.persist(Core.HomeserverAction.PUT, {
      params,
      layout: params.layout,
    });

    if (!feed) {
      throw new Error('Failed to create feed');
    }

    return feed;
  }

  static async update(params: Core.TFeedUpdateParams): Promise<Core.FeedModelSchema> {
    const existing = await Core.FeedModel.findById(params.feedId);
    if (!existing) {
      throw new Error('Feed not found');
    }

    const merged: Core.TFeedCreateParams = {
      name: existing.name,
      tags: params.changes.tags ?? existing.tags,
      reach: params.changes.reach ?? existing.reach,
      sort: params.changes.sort ?? existing.sort,
      content: params.changes.content !== undefined ? params.changes.content : existing.content,
      layout: params.changes.layout ?? existing.layout,
    };

    const feed = await Core.FeedApplication.persist(Core.HomeserverAction.PUT, {
      params: merged,
      layout: merged.layout,
      existingId: params.feedId,
    });

    if (!feed) {
      throw new Error('Failed to update feed');
    }

    return feed;
  }

  static async delete(params: Core.TFeedDeleteParams): Promise<void> {
    await Core.FeedApplication.persist(Core.HomeserverAction.DELETE, {
      feedId: params.feedId,
    });
  }

  static async list(): Promise<Core.FeedModelSchema[]> {
    return Core.FeedModel.findAllSorted();
  }

  static async get(feedId: string): Promise<Core.FeedModelSchema | undefined> {
    return Core.FeedModel.table.get(feedId);
  }

  static getStreamId(feed: Core.FeedModelSchema): Core.PostStreamId {
    return Core.buildFeedStreamId(feed);
  }
}
