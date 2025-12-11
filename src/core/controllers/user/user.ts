import * as Core from '@/core';
import { getActiveStreamId } from '../controller.helpers';

export class UserController {
  private constructor() {} // Prevent instantiation

  /**
   * Get user details from local database
   * This is a read-only operation that queries the local cache
   */
  static async getDetails({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null | undefined> {
    return await Core.ProfileApplication.read({ userId });
  }

  /**
   * Get multiple user details from local database (bulk operation)
   * This is a read-only operation that queries the local cache
   */
  static async bulkGetDetails(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusUserDetails>> {
    return await Core.ProfileApplication.bulkRead(userIds);
  }

  /**
   * Get user counts from local database
   * This is a read-only operation that queries the local cache
   */
  static async getCounts({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserCounts | null> {
    return await Core.UserApplication.counts({ userId });
  }

  /**
   * Get multiple user counts from local database (bulk operation)
   * This is a read-only operation that queries the local cache
   */
  static async bulkGetCounts(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusUserCounts>> {
    return await Core.UserApplication.bulkCounts(userIds);
  }

  /**
   * Get multiple user relationships from local database (bulk operation)
   * This is a read-only operation that queries the local cache
   */
  static async bulkGetRelationships(
    userIds: Core.Pubky[],
  ): Promise<Map<Core.Pubky, Core.UserRelationshipsModelSchema>> {
    return await Core.UserApplication.bulkRelationships(userIds);
  }

  /**
   * Get multiple user tags with local-first strategy (bulk operation)
   * Reads from cache first, fetches from API only for missing users
   */
  static async bulkGetTags(userIds: Core.Pubky[]): Promise<Map<Core.Pubky, Core.NexusTag[]>> {
    return await Core.UserApplication.bulkTagsWithFetch(userIds);
  }

  static async follow(eventType: Core.HomeserverAction, { follower, followee }: Core.TFollowParams): Promise<void> {
    const { meta, follow } = Core.FollowNormalizer.to({ follower, followee });

    // Get active stream ID from store (controller layer responsibility)
    const activeStreamId = getActiveStreamId();

    await Core.UserApplication.follow({
      eventType,
      followUrl: meta.url,
      followJson: follow.toJson(),
      follower,
      followee,
      activeStreamId,
    });
  }

  static async mute(eventType: Core.HomeserverAction, { muter, mutee }: Core.TMuteParams): Promise<void> {
    const { meta, mute } = Core.MuteNormalizer.to({ muter, mutee });
    await Core.UserApplication.mute({
      eventType,
      muteUrl: meta.url,
      muteJson: mute.toJson(),
      muter,
      mutee,
    });
  }

  static async tags(params: Core.TUserTagsParams): Promise<Core.NexusTag[]> {
    return await Core.UserApplication.tags(params);
  }

  static async taggers(params: Core.TUserTaggersParams): Promise<Core.NexusUser[]> {
    return await Core.UserApplication.taggers(params);
  }
}
